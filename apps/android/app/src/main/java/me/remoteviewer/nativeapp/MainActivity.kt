package me.remoteviewer.nativeapp

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import java.io.File

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val view = TextView(this)
        view.setPadding(48, 48, 48, 48)
        view.text = nativeSensorReport()
        setContentView(view)
    }
}

private val nodes = listOf(
    "accelerometer" to "/dev/accel0",
    "gyroscope" to "/dev/gyro0",
    "magnetometer" to "/dev/mag0",
    "barometer" to "/dev/baro0",
    "proximity" to "/dev/prox0",
    "ambient-light" to "/dev/light0",
    "gps" to "/dev/gps0",
    "camera-depth" to "/dev/depth0",
    "lidar" to "/dev/lidar0",
)

fun nativeSensorReport(): String {
    val lines = nodes.map { (name, node) ->
        if (File(node).exists()) "present $name" else "FAIL $name device not present"
    }
    return "Native Android. No Play Services.\n" + lines.joinToString("\n")
}
