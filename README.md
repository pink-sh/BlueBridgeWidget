BlueBridge Common Widget
=======================

Introduction
-----------------
The **BlueBridge Common Widget** gives the developer a basic set of functionalities to draw and run experiments on the BlueBridge DataMiner either using OpenCPU/WPS Client or WPS/Ajax calls.

Usage
--------
Basic Usage is to extend the BBWidget class with your own and then init the widget as in the html sample page.
The extended class (or plugin) should have an empty constructor and should also have the implementation of the functions:
	**init(wps_uri, wps_username, wps_token, experiment_id, opencpu_url, div_id, plugin_options)**
    Initialize the plugin with all the parameters of the BBWidget constructor.
	**draw()**
	Where the developer will write all the business logic.

Tips
------
The developer can use any kind of library or framework is confortable with.