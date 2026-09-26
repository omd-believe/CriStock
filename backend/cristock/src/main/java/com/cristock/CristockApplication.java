package com.cristock;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CristockApplication {

	public static void main(String[] args) {
		SpringApplication.run(CristockApplication.class, args);
	}

}
