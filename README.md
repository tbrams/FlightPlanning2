# FlightPlanning2
This is the next evolution of the Google Sheet based planning tool I created while studying for my PPL license. It is still based on the Flight Plan format used by Copenhagen Air Taxa and the focus here is VFR route planning using Google Maps as a front end to the spreadsheet. 

# Usage
Everything is controlled from a Google Sheet with this code installed. When opened it looks like a normal spreadsheet. There is, however, a new menu point called "Navigation" - select that and click "Route Planning" to start the Map based planning tool...
<p align="center">
<img width="400" alt="Navigation Menu" src="https://user-images.githubusercontent.com/3058746/38123587-24b6c8f6-3406-11e8-8b4a-f3e9a64fb334.png">
</p>

I originally experimented with saving trips in a spreadsheet based database structure, but this turned out to be cumbersome and slow in real life, so I stopped focussing on this again and you can simply press "Clear" to get started from the intial dialogue
<p align="center">
<img width="400" alt="Clear" src="https://user-images.githubusercontent.com/3058746/38123599-3c94bda2-3406-11e8-8dda-fc4e3a56285d.png">
</p>

Once the Map based planning tool is started you can start positioning the map and inserting way points by clicking on the map and continuing to do so with different zooms i necessary.
<p align="center">
<img width="200" alt="WP0" src="https://user-images.githubusercontent.com/3058746/38123621-4fa2164c-3406-11e8-8329-5c2f254657fa.png">
<img width="200" alt="WP1" src="https://user-images.githubusercontent.com/3058746/38123642-665457e2-3406-11e8-9f89-c1063a952c98.png">
</p>

Should you want to you can also view and edit the details for a certain way point by clicking it. Click "Update" to save your details. 
<p align="center">
<img width="400" alt="Edit" src="https://user-images.githubusercontent.com/3058746/38123656-788c818c-3406-11e8-920a-fffd78452873.png">
</p>
Besides getting the radial and distances to the top three neares nav aids from this info box, you might also want to update the temporary assigned Waypoint Name to something that makes more sense in the flight plan.

Once done with everything, you can complete the plan by clicking "Save Route" and git it a short description...
<p align="center">
<img width="400" alt="Circuit complete" src="https://user-images.githubusercontent.com/3058746/38123669-91cdd3f8-3406-11e8-950b-896fa7e294d6.png">
</p>

After a few seconds the spreadsheet will finish updating the navigational tables as seen here
<p align="center">
<img width="400" alt="Finished route table" src="https://user-images.githubusercontent.com/3058746/38123718-cc7a7f1a-3406-11e8-85ca-e27a9cf12c0e.png">
</p>

Select the sheet called "PLAN" to inspect and fine tune your flightplan
<p align="center">
<img width="400" alt="Page2" src="https://user-images.githubusercontent.com/3058746/38123721-d7edcab4-3406-11e8-89e9-522db7dadd57.png">
</p>


## To Be Updated
- Many features are left undocumented
- Spreadsheet structure might be shared in a public template if needed
- How to delete a WP
- How to move a WP
- How to insert a new WP
- How to change the sequence of WP's
- Maintaining Navaids