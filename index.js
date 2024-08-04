const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Person = require('./models/personData');
const Vehicle = require('./models/vehicleData');
const app = express();
const port = 8081;

app.use(express.json());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send("Hello world port connected!");
});

// Add a person
app.post('/api/person', async (req, res) => {
    try {
        const { userName, emailId, vehicleType, vehicleName, vehicleNum } = req.body;

        if (!userName || !emailId || !vehicleType || !vehicleName || !vehicleNum) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingPerson = await Person.findOne({ emailId });
        if (existingPerson) {
            return res.status(409).json({ message: "Email already exists" });
        }

        // Check if vehicleType is valid
        const allowedVehicleTypes = ['E-BIKE', 'BIKE', 'E-CAR', 'CAR', 'Bike', 'bike', 'E-bike', 'e-bike', 'car', 'Car', 'e-car'];
        if (!allowedVehicleTypes.includes(vehicleType)) {
            return res.status(400).json({ message: "Invalid vehicle type" });
        }

        const newPerson = new Person({
            userName: userName,
            emailId: emailId,
        });

        const savedPerson = await newPerson.save();

        const newVehicle = new Vehicle({
            vehicleName: vehicleName,
            vehicleType: vehicleType,
            personId: savedPerson._id,
            vehicleNum: vehicleNum
        });

        const savedVehicle = await newVehicle.save();

        res.status(200).json({
            message: "Person details successfully added!",
            personData: savedPerson,
            vehicleData: savedVehicle
        });
    } catch (error) {
        console.error("Error creating person and vehicle:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

// Get all persons details
app.get('/api/person', async (req, res) => {
    try {
        //find all persons populated with vehicles
        const findPerson = await Person.find().populate('vehicles');
        if (findPerson) {
            res.json({ message: "Success..", data: findPerson });
        } else {
            res.json({ message: "No user found" });
        }
    } catch (error) {
        console.error("Error fetching person details:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


app.get('/api/person/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // find person by ID and populate vehicles
        const findPerson = await Person.findById(id).populate('vehicles');

        if (findPerson) {
            // find vehicles associated with this person
            const findVehicles = await Vehicle.find({ personId: id });

            res.json({message: "Success!",data: {person: findPerson,vehicles: findVehicles}});
        } else {
            res.status(404).json({ message: "No user found with ID: " + id });
        }
    } catch (error) {
        console.error("Error fetching person by ID:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


app.put('/api/person/:id', async (req, res) => {
    try {
        console.log("put action");
        const { id } = req.params;
        const updatePerson = await Person.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!updatePerson) {
            return res.status(404).json({ message: "Person details not found!" });
        }
        res.status(200).json({ message: "Person details successfully edited!", data: updatePerson });
    } catch (error) {
        console.error("Error updating person details:", error);
        res.status(500).json({ message: "Person details can't be edited!", error: error.message });
    }
});



//delete with a person id

app.delete('/api/delete/:id', async (req, res) => {

    try {
        const { id } = req.params;
        const findPerson = await Person.findById(id);
        if (!findPerson) {
            return res.status(404).json({ message: "Details not found!" });
        }
        await Person.findByIdAndDelete(id);
        res.status(200).json({ message: "Successfully deleted!" });
    } catch (error) {
        console.error("Error deleting person:", error);
        res.status(500).json({ message: "Something went wrong. Can't delete." });
    }
});



//for vehicle part api

app.post('/create/:personId', async (req, res) => {
    try {
        const { vehicleName, vehicleType } = req.body;
        const { personId } = req.params;

        const findPerson = await Person.findById(personId);
        if (!findPerson) {
            return res.status(404).json({ message: "User not found!", personId: personId });
        }

        const newVehicle = new Vehicle({ vehicleName: vehicleName, vehicleType: vehicleType, personId: findPerson._id });
        const savedVehicle = await newVehicle.save();

        findPerson.vehicles.push(savedVehicle._id);
        await findPerson.save();

        return res.status(201).json({ message: "Successfully created!", vehicle: savedVehicle });
    } catch (error) {
        console.error("Something went wrong! Can't create:", error);
        res.status(500).json({ message: "Error!" });
    }
});


// get vehicle deails with id 

app.get('/api/getVehicle/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const findVehicle = await Vehicle.findById(id);
        if (findVehicle) {
            return res.json({ message: "Vehicle found!", data: findVehicle });
        } else {
            return res.status(404).json({ message: "Data not found for ID: " + id });
        }
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return res.status(500).json({ message: "Error fetching vehicle." });
    }
});


//get details with id

app.get('/api/getVechiWithPerson/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const findVehicle = await Person.findById(id);
        if (findVehicle) {
            return res.json({ message: "Vehicle found!", data: findVehicle });
        } else {
            return res.status(404).json({ message: "Data not found for ID: " + id });
        }
    } catch (error) {
        console.error("Error fetching vehicle:", error);
        return res.status(500).json({ message: "Error fetching vehicle." });
    }
});

mongoose.connect('mongodb://localhost:27017/pvDataBase', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Database connected..");
        app.listen(port, () => {
            console.log(`Connected to the server on port ${port}`);
        });
    })
    .catch((error) => {
        console.log('Connection error', error);
    });
