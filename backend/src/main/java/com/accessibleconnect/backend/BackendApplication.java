package com.accessibleconnect.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(BackendApplication.class, args);
	}

	private static void loadEnv() {
		File envFile = new File(".env");
		if (!envFile.exists()) {
			envFile = new File("../.env");
		}

		if (envFile.exists()) {
			System.out.println("[SignBridge] Loading environment configuration from: " + envFile.getAbsolutePath());
			try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
				String line;
				while ((line = reader.readLine()) != null) {
					line = line.trim();
					if (line.isEmpty() || line.startsWith("#")) {
						continue;
					}
					int eqIdx = line.indexOf('=');
					if (eqIdx > 0) {
						String key = line.substring(0, eqIdx).trim();
						String value = line.substring(eqIdx + 1).trim();
						
						if (System.getenv(key) == null && System.getProperty(key) == null) {
							System.setProperty(key, value);
						}
					}
				}
				System.out.println("[SignBridge] Environment configuration loaded successfully.");
			} catch (IOException e) {
				System.err.println("[SignBridge] Warning: Failed to read .env file: " + e.getMessage());
			}
		} else {
			System.out.println("[SignBridge] No .env file detected. Relying on system variables.");
		}
	}
}

