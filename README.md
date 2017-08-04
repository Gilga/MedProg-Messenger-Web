# MedProg-Messenger-Web
purpose: JPA model & REST services

# Installation

## Requirements
- Messenger-Model: https://github.com/Gilga/MedProg-Messenger
- mysql

## Optional
Messenger-JUnit-Tests: https://github.com/Gilga/MedProg-Messenger-Tests

## Project Setup

### Dependencies
- User-Libraries
  - java-util-1.1
    - ./java/sb-toolbox-1.1.x.jar

  - javaee-api-7
    - ./java/javaee-api-7.0.jar
    - ./java/javaee-api-7.0-sources.jar -> source attachment (external source) for above

  - eclipse-link-2.5 (required for @CacheIndex annotation)
    - ./jpa/eclipse-link-2.5.x/eclipselink.jar


### Project Settings
- ensure Compiler Compliance Level 1.8+ (Properties->Java Compiler)
  on Eclipse IDE for Java Developers, version Luna+
