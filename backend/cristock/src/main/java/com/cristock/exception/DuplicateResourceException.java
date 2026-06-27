package com.cristock.exception;

public class DuplicateResourceException extends ResourceNotFoundException{

    public DuplicateResourceException(String message){
        super(message);
    }
}
