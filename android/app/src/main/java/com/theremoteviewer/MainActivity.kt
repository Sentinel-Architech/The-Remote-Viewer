package com.theremoteviewer

import android.Manifest
import android.app.Activity
import android.app.KeyguardManager
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Looper
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import java.io.IOException

/**
 * Native install. Platform widgets and the device GPS provider only.
 * This activity does not host a website.
 */
class MainActivity : Activity() {
    private lateinit var lockStatus: TextView
    private lateinit var lockProgress: ProgressBar
    private lateinit var weightStatus: TextView
    private lateinit var weightProgress: ProgressBar
    private lateinit var gpsStatus: TextView
    private var gpsListener: LocationListener? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        lockStatus = findViewById(R.id.lock_status)
        lockProgress = findViewById(R.id.lock_progress)
        weightStatus = findViewById(R.id.weight_status)
        weightProgress = findViewById(R.id.weight_progress)
        gpsStatus = findViewById(R.id.gps_status)
        showInstallTutorial()
        findViewById<Button>(R.id.check_lock).setOnClickListener { showDeviceLock() }
        findViewById<Button>(R.id.read_gps).setOnClickListener { askForNativeGps() }
        showDeviceLock()
        measureShippedWeight()
    }

    private fun showInstallTutorial() {
        val host = findViewById<LinearLayout>(R.id.tutorial_steps)
        val steps = resources.getStringArray(R.array.install_tutorial)
        for (step in steps) {
            val line = TextView(this)
            line.text = step
            line.setTextColor(getColor(R.color.muted))
            line.textSize = 15f
            val params = LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.WRAP_CONTENT,
            )
            params.topMargin = (8 * resources.displayMetrics.density).toInt()
            line.layoutParams = params
            host.addView(line)
        }
    }

    /** Count packaged weight bytes. The bar moves only after that count matches the shipped file. */
    private fun measureShippedWeight() {
        Thread {
            val counted = countAssetBytes(SHIPPED_WEIGHT_NAME)
            runOnUiThread {
                if (isDestroyed) return@runOnUiThread
                if (counted == SHIPPED_WEIGHT_BYTES) {
                    weightStatus.text = getString(R.string.weight_measured, counted.toString())
                    weightProgress.visibility = View.VISIBLE
                    weightProgress.progress = 1
                } else if (counted == null) {
                    weightStatus.text = getString(R.string.weight_waiting)
                } else {
                    weightStatus.text = getString(R.string.weight_mismatch, counted.toString())
                }
            }
        }.start()
    }

    private fun countAssetBytes(name: String): Long? {
        return try {
            assets.open(name).use { input ->
                val buf = ByteArray(64 * 1024)
                var total = 0L
                while (true) {
                    val n = input.read(buf)
                    if (n < 0) break
                    total += n
                }
                total
            }
        } catch (_: IOException) {
            null
        }
    }

    override fun onDestroy() {
        stopGps()
        super.onDestroy()
    }

    private fun showDeviceLock() {
        val keyguard = getSystemService(KeyguardManager::class.java)
        lockStatus.text = if (keyguard?.isDeviceSecure == true) {
            getString(R.string.lock_on)
        } else {
            getString(R.string.lock_off)
        }
        lockProgress.progress = 1
    }

    private fun askForNativeGps() {
        val granted = checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) ==
            PackageManager.PERMISSION_GRANTED
        if (!granted) {
            requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), GPS_REQUEST)
            return
        }
        readNativeGps()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray,
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode != GPS_REQUEST) return
        if (grantResults.firstOrNull() == PackageManager.PERMISSION_GRANTED) {
            readNativeGps()
        } else {
            gpsStatus.text = getString(R.string.gps_denied)
        }
    }

    private fun readNativeGps() {
        val manager = getSystemService(LocationManager::class.java)
        if (manager == null || !manager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
            gpsStatus.text = getString(R.string.gps_off)
            return
        }
        val fine = checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION)
        if (fine != PackageManager.PERMISSION_GRANTED) {
            gpsStatus.text = getString(R.string.gps_denied)
            return
        }
        stopGps()
        val listener = object : LocationListener {
            override fun onLocationChanged(location: Location) {
                if (location.provider != LocationManager.GPS_PROVIDER) return
                gpsStatus.text = getString(R.string.gps_fix, location.latitude, location.longitude)
                stopGps()
            }

            @Deprecated("Platform callback. Unused.")
            override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) = Unit
        }
        gpsListener = listener
        manager.requestLocationUpdates(
            LocationManager.GPS_PROVIDER,
            0L,
            0f,
            listener,
            Looper.getMainLooper(),
        )
        val last = manager.getLastKnownLocation(LocationManager.GPS_PROVIDER)
        if (last != null) {
            gpsStatus.text = getString(R.string.gps_fix, last.latitude, last.longitude)
        } else {
            gpsStatus.text = getString(R.string.gps_none)
        }
    }

    private fun stopGps() {
        val listener = gpsListener ?: return
        getSystemService(LocationManager::class.java)?.removeUpdates(listener)
        gpsListener = null
    }

    companion object {
        private const val GPS_REQUEST = 41
        private const val SHIPPED_WEIGHT_NAME = "model.safetensors"
        private const val SHIPPED_WEIGHT_BYTES = 51667832L
    }
}
