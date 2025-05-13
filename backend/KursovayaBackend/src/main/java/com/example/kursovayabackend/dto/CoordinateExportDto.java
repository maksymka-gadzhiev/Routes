package com.example.kursovayabackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class CoordinateExportDto {
    private Double x;
    private Double y;
    private String elevation;
    private Integer orderNumber;

}
