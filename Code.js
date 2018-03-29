function onOpen() {
    SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
        .createMenu('Navigation')
        .addItem('Route Planning', 'showDialog')
        .addToUi();
}

function showDialog() {
    var html = HtmlService.createTemplateFromFile('Page')
        .evaluate();
    html.setWidth(800)
        .setHeight(600);

    SpreadsheetApp.getUi().showModalDialog(html, 'Route Planning');
}

/**
 * For the purpose of best practise and avoid having to type all this again and again
 * this function will include the requested file.
 *
 * As an alternative, we could write something like
 * <?!= HtmlService.createHtmlOutputFromFile('stylesheet').getContent(); ?>
 *
 * But this is shorter and more elegant
 *
 */
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
}


/**
 * Clear everything in the current plan
 *
 */
function clearCurrentPlan() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Front");
    var row   = sheet.getRange("db").getRowIndex() + 1;
    var lastRow = firstEmptyRow("Front", "db", 0);
    var lastColumn = sheet.getRange("db").getLastColumn();
    sheet.getRange(row, 1, lastRow - row, lastColumn).clear();
}

/**
 * Write coordinates to way point table
 * Need to do this in one operation otherwise rows will be overwritten
 * by threads completing before other threads.
 *
 * arguments here is an array with all the data we will feed to the table
 * and a short title to be used in the data index table
 *
 */
function writeCoords(myArr, shortTitle) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Front");
    var row = sheet.getRange("db").getRowIndex() + 1;

    // clear whatever is there - find first empty row after data
    clearCurrentPlan();
  
    // Prepare coordinates for backing up all points to the databank
    var col3 = sheet.getRange("DataBank").getColumn();
    var row3 = firstEmptyRow("Front", "DataBank", col3);
    Logger.log("Will start writing in DataBank row %s and col %s", row2, col2);

    // Prepare coordinates for backing up the data index with this trip
    var col2 = sheet.getRange("DataIndex").getColumn();
    var row2 = firstEmptyRow("Front", "DataIndex", col2);
    Logger.log("Will start writing in DataIndex row %s and col %s", row3, col3);

    var irow;
    var totalDistance = 0;
    for (var i = 0; i < myArr.length; i++) {

        // populate the active route table
        irow = i + row;
        sheet.getRange(irow, 1).setValue(myArr[i][0]);
        sheet.getRange(irow, 2).setValue(myArr[i][1]);
        sheet.getRange(irow, 3).setValue(myArr[i][2]);
        sheet.getRange(irow, 4).setValue(myArr[i][3]);
        sheet.getRange(irow, 5).setValue(myArr[i][4]);
        sheet.getRange(irow, 6).setValue(myArr[i][5]);
        sheet.getRange(irow, 7).setValue(myArr[i][6]);

        // populate the databank backup
        sheet.getRange(i + row3, col3).setValue(myArr[i][0]);
        sheet.getRange(i + row3, col3 + 1).setValue(myArr[i][1]);
        sheet.getRange(i + row3, col3 + 2).setValue(myArr[i][2]);
        sheet.getRange(i + row3, col3 + 3).setValue(myArr[i][3]);
        sheet.getRange(i + row3, col3 + 4).setValue(myArr[i][4]);
        sheet.getRange(i + row3, col3 + 5).setValue(myArr[i][5]);
        sheet.getRange(i + row3, col3 + 6).setValue(myArr[i][6]);

        if (i > 0) {
            totalDistance += parseFloat(myArr[i][4], 10);
            Logger.log("totalDistance: " + totalDistance);
        }
    }
    // Keep the trip name handy
    sheet.getRange("dbTripName").setValue(shorttitle);

    // Update the DataIndex table
    var now = new Date();
    sheet.getRange(row2, col2).setValue(shortTitle);
    sheet.getRange(row2, col2 + 1).setValue(now);
    sheet.getRange(row2, col2 + 2).setValue(row3); // FromRow in DataBank
    sheet.getRange(row2, col2 + 3).setValue(row3 + myArr.length - 1); // ToRow in DataBank
    sheet.getRange(row2, col2 + 4).setValue(totalDistance);

}

function testWriteCoords() {
    myArray = [
        ["1", "*Valby", "22.431122", "14.131127", "", "123", "3.11"],
        ["2", "*Hvalsoe", "22.431122", "14.131127", "3.12", "270", "3.12"],
        ["3", "*Dianalund", "22.431122", "14.131127", "3.12", "298", "3.13"]
    ];

    writeCoords(myArray, "Delete me later");
}



/**
 * Find and return first available row after the data in a row header
 * This table will never be full but continue as long as there is available
 * spreadsheet... we have set this to be 10000 rows of data for now.
 *
 * @param {"Planning"}  folder  The sheet to use.
 * @param {"RouteTable"} table  datarange to check.
 * @param {0}            column Column to check.
 *
 * @return         result   Absolute address (so we do not need to look up again)
 *
 * @customfunction
 */
function firstEmptyRow(folder, table, column) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(folder);

    first = sheet.getRange(table).getRowIndex();
    for (ro = 2; ro < 10000; ro++) {
        var cAdr = sheet.getRange(ro + first, column + 1).getA1Notation();
        var cVal = sheet.getRange(cAdr).getValue();
        if (cVal === "") {
            return ro + first;
        }
    }
    return -1;
}

function testFirstEmptyRow() {
    Logger.log(firstEmptyRow("Front", "db", 0));
}


/**
 * Read Current Trip name to front end presentation
 *
 */
function readTripTitle() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Front");
    return sheet.getRange("dbTripName").getValue();
}

function testReadTripTitle(){
  Logger.log(readTripTitle());
}


/**
 * Read WP coordinates to front end presentation and return as an array
 * along with the trip title.
 *
 */
function readCoords() {
    var result = [];
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Front");
    var first = sheet.getRange("db").getRowIndex() + 1;

    // just get the essentials: short name, lat, lon and deviation
    for (var i = first; i < 100; i++) {
        var lat = sheet.getRange(i, 3).getValue();
        if (lat != "") {
            var lon = sheet.getRange(i, 4).getValue();
            var name = sheet.getRange(i, 2).getValue();
            var declination = sheet.getRange(i, 7).getValue();
            result.push([i - first, name, lat, lon, declination])
        } else
            break;
    }
    return [sheet.getRange("dbTripName").getValue() ,result];
}


function testReadCoords() {
    var res = readCoords();
    Logger.log("Trip title is %s", res[0]);
    var r=res[1];
    for (var i = 0; i < r.length; i++) {
        Logger.log("%s) %s: (%s, %s) decl: %s", r[i][0], r[i][1], r[i][2], r[i][3], r[i][4]);
    }
}

/**
 * Read VOR_TABLE into an array table and return this to front end
 * Used by page.js.html to populate map with navigational radio stations
 *
 * @return {table} Table with VOR name and coordinates
 */
 function readVORs() {
     var vorArr = [];
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
     var first = sheet.getRange("TABLE_VOR").getRowIndex() + 1;
     for (var i = first; i < 100; i++) {
         // Get first column and process it if there is contents, otherwise break
         var name = sheet.getRange(i, 1).getValue();
         if (name != "") {
             var lat = sheet.getRange(i, 2).getValue();
             var lon = sheet.getRange(i, 3).getValue();
             vorArr.push([i - first, name, lat, lon])
         } else
             break;
     }
     return vorArr;

 }

 function testReadVORs() {
     r = readVORs();
     for (var i = 0; i < r.length; i++) {
         Logger.log("%s) %s: (%s, %s)", r[i][0], r[i][1], r[i][2], r[i][3]);
     }
 }

/*
 * get the precise decimal notation year for the magnetic declination calculations
 * @param None
 *
 * @return  decimal_fraction_year
 *
 * @customfunction
 */
function getDecimalYear() {
    var t = new Date();
    var year = t.getFullYear();
    var n1 = new Date(year, 0, 1);
    var d1 = new Date(year, 11, 31);
    var d2 = new Date(year - 1, 11, 31);

    return year + (t - n1) / (d1 - d2);
}

function testGetDecimalYear() {
    Logger.log("Today in decimal fraction year notation is: " + getDecimalYear());
}

/*
 * Wrapper function for getting magnetic declination
 *
 * Simplified:
 *   MSL set to zerom, and
 *   current decimal year for timing
 */
function getDeclination(lat, lon) {
    var DEC_YEAR = getDecimalYear();
    return GetWMM(0, lat, lon, DEC_YEAR, 5);
}

function testGetDeclination() {
    Logger.log(getDeclination(55.59, 12.13));
}


/**
 * Write coordinates to navigation table along with formulaes
 * Need to do this in one operation otherwise rows will be overwritten
 * by threads completing before other threads.
 *
 * argument here is an array with all the data we will feed to the table
 *
 */
function writeNavTable(myArr) {
    const COL_DIST = 1;
    const COL_MINALT = 2;
    const COL_ALT = 3;
    const COL_IAS = 4;
    const COL_TAS = 5;
    const COL_WIND = 6;
    const COL_GS = 7;
    const COL_TT = 8;
    const COL_WCA = 9;
    const COL_TH = 10;
    const COL_VAR = 11;
    const COL_MH = 12;
    const COL_NAME = 13;
    const COL_TIME = 14;
    const COL_ACC = 15;
    const COL_ETO = 16;

    const COLOR_CALC = "#c9daf8";
    const COLOR_DEF = "#d9d9d9";
    const COLOR_USER = "#b6d7a8";

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Plan");
    var minalt = sheet.getRange("PlanMinAlt").getValue();
    var alt = sheet.getRange("PlanAlt").getValue();
    Logger.log("Background color of this field is %s", sheet.getRange("PlanAlt").getBackground());
    var tas = sheet.getRange("PlanTAS").getValue();
    var wind = sheet.getRange("PlanWind").getValue();


    var row = sheet.getRange("Plan").getRowIndex() + 1;
    var lastRow = firstEmptyRow("Plan", "Plan", 0);
    var lastColumn = sheet.getRange("plan").getLastColumn();
    Logger.log("First row is %s and last row is %s", row, lastRow);

    // Clear old plan
    sheet.getRange(row, 1, lastRow - row, lastColumn).clear();


    // Note that for the Navigation planning, we do not use the first point because we are only interested
    // in distances and bearings to next point, so the for loop starts at 1.
    for (var i = 1; i < myArr.length; i++) {
        irow = i + row - 1;
        Logger.log("Processing %s", myArr[i][1]);
        sheet.getRange(irow, COL_NAME).setValue(myArr[i][1]); // Name
        sheet.getRange(irow, COL_NAME).setBackground(COLOR_CALC);
        sheet.getRange(irow, COL_MINALT).setValue(minalt); // Min alt
        sheet.getRange(irow, COL_MINALT).setBackground(COLOR_DEF);
        sheet.getRange(irow, COL_ALT).setValue(alt); // Alt
        sheet.getRange(irow, COL_ALT).setBackground(COLOR_DEF);
        sheet.getRange(irow, COL_DIST).setValue(myArr[i][4]); // Distance
        sheet.getRange(irow, COL_DIST).setBackground(COLOR_CALC);
        sheet.getRange(irow, COL_TAS).setValue(tas); // TAS
        sheet.getRange(irow, COL_TAS).setBackground(COLOR_DEF);
        sheet.getRange(irow, COL_WIND).setValue(wind); // wind
        sheet.getRange(irow, COL_WIND).setBackground(COLOR_DEF);
        sheet.getRange(irow, COL_TT).setValue(myArr[i][5]); // Bearing
        sheet.getRange(irow, COL_TT).setBackground(COLOR_CALC);
        sheet.getRange(irow, COL_VAR).setValue(myArr[i][6]); // Magnetic Declination
        sheet.getRange(irow, COL_VAR).setBackground(COLOR_CALC);


        // Write formula as well
        var str = '=IFERROR(round(sqrt(1-(MID(F#,FIND("/",F#)+1,10)*SIN(RADIANS(MID(F#,1,FIND("/",F#)-1)-H#))/E#)^2)*(E#-MID(F#,FIND("/",F#)+1,10)*COS(RADIANS(MID(F#,1,FIND("/",F#)-1)-H#)))),"N/A")';
        writeFormula(str, irow, COL_GS);
        sheet.getRange(irow, COL_GS).setBackground(COLOR_CALC);

        str = '=IFERROR(round(DEGREES(ATAN(MID(F#,FIND("/",F#)+1,10)*SIN(RADIANS(MID(F#,1,FIND("/",F#)-1)-H#))/(E#)))),"N/A")';
        writeFormula(str, irow, COL_WCA);
        sheet.getRange(irow, COL_WCA).setBackground(COLOR_CALC);

        str = '=IFERROR(IF((H#+I#)<0,360+H#+I#,H#+I#),"N/A")';
        writeFormula(str, irow, COL_TH);
        sheet.getRange(irow, COL_TH).setBackground(COLOR_CALC);

        str = '=IFERROR(E#/(1+C#/1000*0.02),"N/A")';
        writeFormula(str, irow, COL_IAS);
        sheet.getRange(irow, COL_IAS).setBackground(COLOR_CALC);

        str = '=IFERROR(J#-K#,"N/A")';
        writeFormula(str, irow, COL_MH);
        sheet.getRange(irow, COL_MH).setBackground(COLOR_CALC);

        str = '=round((A#/G#)*60)+2';
        writeFormula(str, irow, COL_TIME);
        if (i == 1) {
            str = '=N#';
            writeFormula(str, irow, COL_ACC);
        } else {
            str = '=O' + (irow - 1) + '+N' + irow;
            writeFormula(str, irow, COL_ACC);
        }
        sheet.getRange(irow, COL_TIME).setBackground(COLOR_DEF);
        sheet.getRange(irow, COL_ACC).setBackground(COLOR_DEF);
        sheet.getRange(irow, COL_ETO).setBackground(COLOR_USER);

    }

}

function testWriteNavTable() {
    myArray = [
        ["1", "*EKRK", "55.59", "12.13", "", "", "3.4"],
        ["2", "*Solroed", "55.53", "12.18", "3.8", "152", "3.42"],
        ["3", "*Hvidovre", "55.63", "12.47", "11.5", "58", "3.5"]
    ];

    writeNavTable(myArray);
}


function writeFormula(formula, row, col) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Plan");
    var regex = new RegExp('\#', 'g');
    var newformula = formula.replace(regex, row);
    sheet.getRange(row, col).setFormula(newformula);
    Logger.log("Written formula %s in cell(%s,%s)", newformula, row, col);
}

function writeFormulaGS(row) {
    const COL_DIST = 1;
    const COL_TT = 8;
    const COL_GS = 7;
    const COL_WCA = 9;
    const COL_TH = 10;
    const COL_VAR = 11;
    const COL_MH = 12;
    const COL_NAME = 13;
    const COL_TIME = 14;

    var str = '=round(sqrt(1-(MID(F#,FIND("/",F#)+1,10)*SIN(RADIANS(MID(F#,1,FIND("/",F#)-1)-H#))/E#)^2)*(E#-MID(F#,FIND("/",F#)+1,10)*COS(RADIANS(MID(F#,1,FIND("/",F#)-1)-H#))))';
    writeFormula(str, row, COL_GS);

    str = '=round(DEGREES(ATAN(MID(F#,FIND("/",F#)+1,10)*SIN(RADIANS(MID(F#,1,FIND("/",F#)-1)-H#))/(E#))))';
    writeFormula(str, row, COL_WCA);

    str = '=IF((H#+I#)<0,360+H#+I#,H#+I#)';
    writeFormula(str, row, COL_TH);

    str = '=J#-K#';
    writeFormula(str, row, COL_MH);

    str = '=round((A#/G#)*60)+2';
    writeFormula(str, row, COL_TIME);
}

function testWriteGS() {
    writeFormulaGS(6);
}


/*
 * Delete trip from file
 *
 * The parameter is the index to the trip index table where we will find the row from and row to
 * information we need to manipulate the data on file.
 *
 */
function deleteTrip(n) {
    SpreadsheetApp.getActiveSpreadsheet().toast("Deleting on server...","",-1);

  
    Logger.log("Delete trip %s", n);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Front");
    var firstRow = sheet.getRange("DataIndex").getRowIndex() + 1;
    var firstCol = sheet.getRange("DataIndex").getColumn();

    var fromRow = sheet.getRange(firstRow + n - 1, firstCol + 2).getValue();
    if (fromRow == "") return;

    var toRow = sheet.getRange(firstRow + n - 1, firstCol + 3).getValue();
    var dbChunk = (toRow - fromRow) + 1;
    var c1 = sheet.getRange("DataBank").getColumn();
    var c2 = c1 + 6;

    Logger.log("Deleting rows (%s, %s, %s, %s) ", fromRow, c1, toRow, c2);
    deleteCells(fromRow, c1, toRow, c2);

    Logger.log("Deleting trip %s in DataIndex", n);

    c1 = sheet.getRange("DataIndex").getColumn();
    c2 = c1 + 4;
    fromRow = sheet.getRange("DataIndex").getRowIndex() + n;
    toRow = fromRow;
    deleteCells(fromRow, c1, toRow, c2);

    // update all rows after this with new addresses into databank
    var eoIndex = firstEmptyRow("Plan", "DataIndex", 0) + firstRow - 1;
    Logger.log("eoIndex: %s", eoIndex);
    for (var i = toRow; i < eoIndex; i++) {
        var oldFrom = sheet.getRange(i, firstCol + 2).getValue();
        var oldTo = sheet.getRange(i, firstCol + 3).getValue();
        Logger.log("oldFrom %s oldTo %s", oldFrom, oldTo);
        var newFrom = oldFrom - dbChunk;
        var newTo = oldTo - dbChunk;
        Logger.log("newFrom %s newTo %s", newFrom, newTo);
        sheet.getRange(i, firstCol + 2).setValue(newFrom);
        sheet.getRange(i, firstCol + 3).setValue(newTo);
    }
    SpreadsheetApp.getActiveSpreadsheet().toast("Done.");
}

function testDeleteTrip() {
    deleteTrip(8);
}


function testCCT(){
  copyCellsToDB(3,4,4,10);
}

/**
 * Delete section (r1, c1) to (r2, c2)
 * If anything is below, it will be moved up to fill the void
 *
 * @return nothing but builds a table including the following fields
 *
 * @customfunction
 */
function deleteCells(r1, c1, r2, c2) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Front");
    var from = r1;
    var to = r2;
    var nrows = to - from + 1;

    var eot = firstEmptyRow("Plan", "DataBank", 0);

    Logger.log("eot: %s", eot);

    for (var ro = 1; ro < 10000; ro++) {
        var cAdr = sheet.getRange(ro + r1, c1).getA1Notation();
        var cVal = sheet.getRange(cAdr).getValue();
        if (cVal === "") {
            eot = ro + r1 - 1;
            break;
        }
    }
    Logger.log("eot: %s", eot);


    var ncols = c2 - c1 + 1;
    var start = to + 1;

    // 1. copy nrows from start down to from
    Logger.log("Copy:");
    Logger.log("start %s, c1 %s, copy_rows %s, ncols %s", start, c1, eot - r2, ncols);
    if (r2 < eot)
        sheet.getRange(start, c1, eot - r2, ncols).copyTo(sheet.getRange(from, c1));
    else
        sheet.getRange(start, c1, r2 - r1 + 1, ncols).copyTo(sheet.getRange(from, c1));


    if (r2 < eot) {
        // need to clean up after copy
        var liq = eot - start + 1; // left in queue
        var diff = liq - nrows;
        var start_clean_row = r2 + diff + 1;
        var clean_n_rows = eot - start_clean_row + 1;

        Logger.log("Cleaning up:");
        Logger.log("liq %s, diff %s, start_clean_row %s, clean_n_rows %s", liq, diff, start_clean_row, clean_n_rows);
        sheet.getRange(start_clean_row, c1, clean_n_rows, ncols).clear();
    }

}

function testDeleteCells() {
    DeleteCells(17, 10, 17, 14);
}


function updateTrip(n, myArr) {}

/**
 * Convert selected 2d data to an array of 2d points
 *
 * @param {range}  rng  The range to use.
 * @return specially formatted array
 *
 * @customfunction
 */
function selectionToArray(rng) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  var row = sheet.getRange(rng).getRow();
  var col=sheet.getRange(rng).getColumn();
  var result="[";
  for (var i=0; i< sheet.getRange(rng).getNumRows();i++) {
     var lat=sheet.getRange(row+i,col).getValue();
     var lon=sheet.getRange(row+i,col+1).getValue();
     result+="["+lat+","+ lon+"]";
     if (i<sheet.getRange(rng).getNumRows()-1) result+=", ";
  }
  
  return result+']';
}

function testSelectionToAray() {
  Logger.log(selectionToArray('M44:n50'));
}

function getAllPolyData() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  var row = sheet.getRange("TABLE_AREAS").getRow();
  var col = sheet.getRange("TABLE_AREAS").getColumn();
  
  var result=[];
  var n=0;
  var from=0;
  var to=0;
  var low=0;
  var high=0;
  var type=0;
  var coords=[];
  do {
     n=n+1;
     from = sheet.getRange(row+n, col+1).getValue();
     if (from==="") break; 
     to   = sheet.getRange(row+n, col+2).getValue();
     low = sheet.getRange(row+n, col+3).getValue();
     high = sheet.getRange(row+n, col+4).getValue();
     type = sheet.getRange(row+n, col+5).getValue();
     coords=getPolyData(n);
    
     result.push([coords,low,high,type]);
  } while (true);

  Logger.log(result);
  return result;
}



/**
 * Select data in polygon data table "from" row "to" row as indicated
 * by index n in the TABLE_AREAS range
 *
 * return array with LatLng objects
 */
function getPolyData(n, special) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  var row = sheet.getRange("TABLE_AREAS").getRow();
  var col = sheet.getRange("TABLE_AREAS").getColumn();
  var from = sheet.getRange(row+n, col+1).getValue();
  var to   = sheet.getRange(row+n, col+2).getValue();
  var low = sheet.getRange(row+n, col+3).getValue();
  var high = sheet.getRange(row+n, col+4).getValue();
  var type = sheet.getRange(row+n, col+5).getValue();
  Logger.log("%s area #%s goes from %s to %s. Min alt is %s and max is %s", type, n, from, to, low, high);

  // now the data
  var dr = sheet.getRange("TABLE_AREA_DATA").getRow();
  var dc = sheet.getRange("TABLE_AREA_DATA").getColumn();
  
  if (special) {
     var result="[";
     for (i=from;i<to+1;i++) {
         var la=convertToDec(sheet.getRange(i, dc+1).getValue());
         var lo=convertToDec(sheet.getRange(i, dc+2).getValue());
         result+="[ "+la+","+ lo+"]";
         if (i<to) result+=",";
     } 
     result+="]";
  } else {
     var result=[];
     for (i=from;i<to+1;i++) {
         var la=convertToDec(sheet.getRange(i, dc+1).getValue());
         var lo=convertToDec(sheet.getRange(i, dc+2).getValue());
         result.push({lat: la, lng: lo});
     }
  }
  return result;
}

function testGetPolyData() {
  Logger.log(getPolyData(2));
}

/*
 * convert position from degrees, minutes and seconds to
 * decimal format used in Google Maps.
 *
 * Accepts input format like these:
 *    "570613N"
 *   "0095944E"
 */
function convertToDec(dms) {
   if (dms[dms.length-1]=="E") {
      dd=parseInt(dms.substr(0,3),10);
      mm=parseInt(dms.substr(3,2),10);
      ss=parseInt(dms.substr(5,2),10);   
   } else {
      dd=parseInt(dms.substr(0,2),10);
      mm=parseInt(dms.substr(2,2),10);
      ss=parseInt(dms.substr(4,2),10);      
   }
   return dd+mm/60+ss/3600;
}


/**
 * Select data in way point data table "from" row "to" row as indicated
 * by the index table
 *
 * Nothing, will load trip data into active trip table
 */
function loadTrip(n) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Front");
  var row = sheet.getRange("DataIndex").getRow();
  var col = sheet.getRange("DataIndex").getColumn();
  var title= sheet.getRange(row+n, col).getValue();
  var from = sheet.getRange(row+n, col+2).getValue();
  var to   = sheet.getRange(row+n, col+3).getValue();
  Logger.log("The tour:'%s' goes from %s to %s", title, from, to);

  // clear whatever is in the active trip table - find first empty row after data
  clearCurrentPlan()

  // now copy the data
  var col = sheet.getRange("db").getColumn();
  var dc = sheet.getRange("DataBank").getColumn();
  sheet.getRange(from, dc, to-from+1, 7).copyTo(sheet.getRange(row+1, col));
  
  // set the short title field as well
  var shortTitle=sheet.getRange("DataIndex").offset(n, 0).getValue();
  sheet.getRange("dbTripName").setValue(shortTitle);
}

function testLoadTrip() {
  loadTrip(2);
}


/**
 * Get Name, from, to and distance into an array and return this for 
 * startup menu. 
 */
function getTripsOnFile() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Front");
  var row = sheet.getRange("DataIndex").getRow();
  var col = sheet.getRange("DataIndex").getColumn();
  
  var result=[];

  var n=0;
  var name="";
  var from=0;
  var to=0;
  var dist=0;
  do {
     n=n+1;
     name = sheet.getRange(row+n, col).getValue();
     if (name==="") break; 
     from   = sheet.getRange(row+n, col+2).getValue();
     to     = sheet.getRange(row+n, col+3).getValue();
     dist   = sheet.getRange(row+n, col+4).getValue();

     result.push([name, from, to, dist]);
  } while (true);

  Logger.log(result);
  return result;
}
