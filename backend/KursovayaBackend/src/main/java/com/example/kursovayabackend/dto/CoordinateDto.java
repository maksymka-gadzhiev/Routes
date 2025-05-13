package com.example.kursovayabackend.dto;

import lombok.Data;

@Data
public class CoordinateDto {
    private Double x;
    private Double y;
    private String elevation;
    private Integer orderNumber;
}
