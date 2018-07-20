package tomtom.com.wikidemo;

import android.Manifest;
import android.content.pm.PackageManager;
import android.support.annotation.Nullable;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;

import com.wikitude.architect.ArchitectStartupConfiguration;
import com.wikitude.architect.ArchitectView;

import java.io.IOException;

public class MainActivity extends AppCompatActivity {

    private ArchitectView architectView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if (ContextCompat.checkSelfPermission(getApplicationContext(), android.Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{android.Manifest.permission.CAMERA}, 50);
        }

        if (ContextCompat.checkSelfPermission(getApplicationContext(), Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.ACCESS_FINE_LOCATION}, 50);
        }

        this.architectView = (ArchitectView) this.findViewById(R.id.architectView);
        final ArchitectStartupConfiguration config = new ArchitectStartupConfiguration();
        config.setLicenseKey("4bHXRiTfwAXTCeH60c0HKLoi3twDKxItUd56r9isF7hZ04fIqsRxuBMAAondByGMjFAJzJdPaR3/3Ctm8VAP9QMbX/PAnMlLLzynGK9jrbbo19v4oi7t1EoEnbqcl+n24qewNvyanZuuch5wf4889PFmAJTCjVsR5eKmysUxMGNTYWx0ZWRfX8eaqYtW7fSolueGvBUhzkcavmdjGjPO7V+YLGUNbNFK8kTZhjvLWn+nmMl5KZPNvsMkckPzpLaoRiys3Jn3v0KwaM4zsqyGxOMV7zuaETbfoC7iNZ7N4SsSIZHfk+DChZY/9KOcODp76Wu9xA5g6a2EUNfy3aXb+X+VbxSJXUn7vuky5ddnl9z7igKzjT7zGCbkCGd0iOTAZEdkAf2iyz7/oV5zBaTVi1L9twslvFCDGf1OGUKPhh363tnH/ubkaTr4SuV0Vj6EtYhUuU0vJleDLpIo8iJHwo9JeHoyAKvhCT7AlKXsS64U1dKhfpWyXQI7SmnF211OzU5xHd82E967SJzD9UpHg2IEou3V1FYDAye6cCYW6alBSOljIE9MQsIsDPC/VwXjqdz9E7d10YSI/hDfPI419KcDFqRQbn6N1m9oQid3ptaoDhjPMnATRt79OFCDaNxAk9Nv7JaZNM3l5uXgCgf5FWM2wnpzOn6DyZGgqaBvEZzZ8AhAiyRrpXupcEPmU+s4QJUqwbRPHLqa+o6EM1nhRQ==");
        this.architectView.onCreate(config);
    }

    @Override
    protected void onPostCreate(@Nullable Bundle savedInstanceState) {
        super.onPostCreate(savedInstanceState);
        this.architectView.onPostCreate();
        try {
            this.architectView.load("index.html");
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        this.architectView.onPause();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        this.architectView.onDestroy();
    }

    @Override
    protected void onResume() {
        super.onResume();
        this.architectView.onResume();
    }
}
