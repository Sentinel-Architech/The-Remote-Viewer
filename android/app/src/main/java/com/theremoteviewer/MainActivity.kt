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
import android.widget.Button
import android.widget.TextView

/**
 * Native install. Platform widgets and the device GPS provider only.
 * This activity does not host a website.
 */
class MainActivity : Activity() {
    private lateinit var lockStatus: TextView
    private lateinit var gpsStatus: TextView
    private var gpsListener: LocationListener? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        lockStatus = findViewById(R.id.lock_status)
        gpsStatus = findViewById(R.id.gps_status)
        findViewById<Button>(R.id.check_lock).setOnClickListener { showDeviceLock() }
        findViewById<Button>(R.id.read_gps).setOnClickListener { askForNativeGps() }
        showDeviceLock()
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
    }
}
