/*

World Magnetic Model spreasheet scripts. The script returns 
the WMM2015 declination values. Usage example

=getWMM(altitude,latitude,longitude,decimal_year,component)

1) altitude: Altitude (km). Height above the WGS84 ellipsoid. For most uses, 
   it is safe to use the height above mean sea level (MSL). 
2) latitude; Latitude - in decimal degrees, positive for northern hemisphere, 
   negative of southern hemisphere. 40 degree 30 minutes = 40 degrees + (30/60) 
   minutes = 40.5 decimal degrees
3) Longitude - in decimal degrees, positive for eastern hemisphere, negative 
   for western hemisphere. 105 degrees 15 minutes west = 105 + (15/60) minutes 
   West = -105.25 degrees   
4) Year - year or decimal fraction of year for which to compute the declination. 
   This must be within the range of the current model, at present the WMM2015 
   is valid for 2015.0 to 2020.0. The if a cell contains a date in the format 
   mm/dd/yyyy, it may be converted to decimal year by using the spreadsheet 
   formula =YEAR(A1)+(A1-DATE(YEAR(A1),1,1))/(DATE(YEAR(A1),12,31)-DATE(YEAR(A1),1,0))  
5) Component returned. Valid values are 0 to 7.
   0 -> X; Northern component of the magnetic field vector
   1 -> Y; Eastern component of the magnetic field vector
   2 -> Z; Downward component of the magnetic field vector
   3 -> H; Horizontal Magnetic Field Strength
   4 -> F; Magnetic Field Strength
   5 -> Decl; (Angle between the magnetic field vector and true north, positive east)
   6 -> Incl; Angle between the magnetic field vector and the horizontal plane, positive down
   7 -> GV; Grivation (or grid variation) is the angle between grid north and
	        magnetic north. (Latitude => |55| deg). 

The script uses WMM2015 model by the National Geophysical Data Center
http://www.ngdc.noaa.gov/geomag/WMM/DoDWMM.shtml

Bill Chadwick ported WMM C software to Javascript

Manoj Nair, December 2014
manoj.c.nair@noaa.gov

*/


function GetWMM( alt,  lat,  long,  year, comp )
{
  
   
      if (year > 2020.0 || year < 2015.0)
  {
    
     SpreadsheetApp.getActiveSpreadsheet()
    .toast(" Year out of range ! Valid range 2015.0 to 2020.0 ",
           "Error", -1);
    return -999;
  }
  
    if (alt < -10 )
  {
    
     SpreadsheetApp.getActiveSpreadsheet()
    .toast(" Altitude out of range ! Minimum elevation is -10 km ",
           "Error", -1);
    return -999;
  }
  
  if (long > 360.0 || long < -180.0)
  {
    
     SpreadsheetApp.getActiveSpreadsheet()
    .toast(" Longitude out of range ! Valid range -180 to 360 ",
           "Error", -1);
    return -999;
  }
  
   if (lat >= 90 || lat <= -90)
  {
    
     SpreadsheetApp.getActiveSpreadsheet()
    .toast(" Latitude out of range ! 90.0 < Latitude > -90.0  ",
           "Error", -1);
    return -999;
  }
  
  if (comp > 7 || comp < 0)
  {
    
     SpreadsheetApp.getActiveSpreadsheet()
    .toast(" Component out of range ! 0 <= Component =>7  ",
           "Error", -1);
    return -999;
  }
           
    var wmm = new WorldMagneticModel();
    
    var values = wmm.declination(alt, lat, long, year); 
    

  /* values array is [bx,by,bz,bh,ti,dec,dip,gv] */
      
  return values[comp];
  
}

function AboutGetWMM()
{
  
   
      SpreadsheetApp.getActiveSpreadsheet()
      .toast("GetWMM function returns the WMM2015 declination values. More info at ngdc.noaa.gov/geomag. ");
  
}


    

/* DOD World Magnetic Model 2015-2020

    return is declination angle in decimal degrees, 
    +ve for Magnetic North East of True North
    (-999 for < 2015.0 and >= 2020.0)
            
The method knownAnswerTest yields a maximum declination error of 0.007% on the small 2010 USGS test data set. 
The maximum error is at 80S latitude, 120W longitude. The value produced by this code at this point is 70.215 degrees.
This is the same answer as produced by the BGS calculator at http://www.geomag.bgs.ac.uk/gifs/wmm_calc.html

This javascript port by Bill Chadwick, 27-Oct-2008, updated with 2010 coefficients on 3 Jan 2010, update wuth 2015 coefficientis on 20 Dec 2015
email: w.chadwick<at>sky.com

*/

function WorldMagneticModel (){

/* 2015 - 2020 coefficients from WMM.COF
Updated to WMM2015 */

this.coff = [
"	1	,	0	,	-29438.5	,	0	,	10.7	,	0	"	,
"	1	,	1	,	-1501.1	,	4796.2	,	17.9	,	-26.8	"	,
"	2	,	0	,	-2445.3	,	0	,	-8.6	,	0	"	,
"	2	,	1	,	3012.5	,	-2845.6	,	-3.3	,	-27.1	"	,
"	2	,	2	,	1676.6	,	-642	,	2.4	,	-13.3	"	,
"	3	,	0	,	1351.1	,	0	,	3.1	,	0	"	,
"	3	,	1	,	-2352.3	,	-115.3	,	-6.2	,	8.4	"	,
"	3	,	2	,	1225.6	,	245	,	-0.4	,	-0.4	"	,
"	3	,	3	,	581.9	,	-538.3	,	-10.4	,	2.3	"	,
"	4	,	0	,	907.2	,	0	,	-0.4	,	0	"	,
"	4	,	1	,	813.7	,	283.4	,	0.8	,	-0.6	"	,
"	4	,	2	,	120.3	,	-188.6	,	-9.2	,	5.3	"	,
"	4	,	3	,	-335	,	180.9	,	4	,	3	"	,
"	4	,	4	,	70.3	,	-329.5	,	-4.2	,	-5.3	"	,
"	5	,	0	,	-232.6	,	0	,	-0.2	,	0	"	,
"	5	,	1	,	360.1	,	47.4	,	0.1	,	0.4	"	,
"	5	,	2	,	192.4	,	196.9	,	-1.4	,	1.6	"	,
"	5	,	3	,	-141	,	-119.4	,	0	,	-1.1	"	,
"	5	,	4	,	-157.4	,	16.1	,	1.3	,	3.3	"	,
"	5	,	5	,	4.3	,	100.1	,	3.8	,	0.1	"	,
"	6	,	0	,	69.5	,	0	,	-0.5	,	0	"	,
"	6	,	1	,	67.4	,	-20.7	,	-0.2	,	0	"	,
"	6	,	2	,	72.8	,	33.2	,	-0.6	,	-2.2	"	,
"	6	,	3	,	-129.8	,	58.8	,	2.4	,	-0.7	"	,
"	6	,	4	,	-29	,	-66.5	,	-1.1	,	0.1	"	,
"	6	,	5	,	13.2	,	7.3	,	0.3	,	1	"	,
"	6	,	6	,	-70.9	,	62.5	,	1.5	,	1.3	"	,
"	7	,	0	,	81.6	,	0	,	0.2	,	0	"	,
"	7	,	1	,	-76.1	,	-54.1	,	-0.2	,	0.7	"	,
"	7	,	2	,	-6.8	,	-19.4	,	-0.4	,	0.5	"	,
"	7	,	3	,	51.9	,	5.6	,	1.3	,	-0.2	"	,
"	7	,	4	,	15	,	24.4	,	0.2	,	-0.1	"	,
"	7	,	5	,	9.3	,	3.3	,	-0.4	,	-0.7	"	,
"	7	,	6	,	-2.8	,	-27.5	,	-0.9	,	0.1	"	,
"	7	,	7	,	6.7	,	-2.3	,	0.3	,	0.1	"	,
"	8	,	0	,	24	,	0	,	0	,	0	"	,
"	8	,	1	,	8.6	,	10.2	,	0.1	,	-0.3	"	,
"	8	,	2	,	-16.9	,	-18.1	,	-0.5	,	0.3	"	,
"	8	,	3	,	-3.2	,	13.2	,	0.5	,	0.3	"	,
"	8	,	4	,	-20.6	,	-14.6	,	-0.2	,	0.6	"	,
"	8	,	5	,	13.3	,	16.2	,	0.4	,	-0.1	"	,
"	8	,	6	,	11.7	,	5.7	,	0.2	,	-0.2	"	,
"	8	,	7	,	-16	,	-9.1	,	-0.4	,	0.3	"	,
"	8	,	8	,	-2	,	2.2	,	0.3	,	0	"	,
"	9	,	0	,	5.4	,	0	,	0	,	0	"	,
"	9	,	1	,	8.8	,	-21.6	,	-0.1	,	-0.2	"	,
"	9	,	2	,	3.1	,	10.8	,	-0.1	,	-0.1	"	,
"	9	,	3	,	-3.1	,	11.7	,	0.4	,	-0.2	"	,
"	9	,	4	,	0.6	,	-6.8	,	-0.5	,	0.1	"	,
"	9	,	5	,	-13.3	,	-6.9	,	-0.2	,	0.1	"	,
"	9	,	6	,	-0.1	,	7.8	,	0.1	,	0	"	,
"	9	,	7	,	8.7	,	1	,	0	,	-0.2	"	,
"	9	,	8	,	-9.1	,	-3.9	,	-0.2	,	0.4	"	,
"	9	,	9	,	-10.5	,	8.5	,	-0.1	,	0.3	"	,
"	10	,	0	,	-1.9	,	0	,	0	,	0	"	,
"	10	,	1	,	-6.5	,	3.3	,	0	,	0.1	"	,
"	10	,	2	,	0.2	,	-0.3	,	-0.1	,	-0.1	"	,
"	10	,	3	,	0.6	,	4.6	,	0.3	,	0	"	,
"	10	,	4	,	-0.6	,	4.4	,	-0.1	,	0	"	,
"	10	,	5	,	1.7	,	-7.9	,	-0.1	,	-0.2	"	,
"	10	,	6	,	-0.7	,	-0.6	,	-0.1	,	0.1	"	,
"	10	,	7	,	2.1	,	-4.1	,	0	,	-0.1	"	,
"	10	,	8	,	2.3	,	-2.8	,	-0.2	,	-0.2	"	,
"	10	,	9	,	-1.8	,	-1.1	,	-0.1	,	0.1	"	,
"	10	,	10	,	-3.6	,	-8.7	,	-0.2	,	-0.1	"	,
"	11	,	0	,	3.1	,	0	,	0	,	0	"	,
"	11	,	1	,	-1.5	,	-0.1	,	0	,	0	"	,
"	11	,	2	,	-2.3	,	2.1	,	-0.1	,	0.1	"	,
"	11	,	3	,	2.1	,	-0.7	,	0.1	,	0	"	,
"	11	,	4	,	-0.9	,	-1.1	,	0	,	0.1	"	,
"	11	,	5	,	0.6	,	0.7	,	0	,	0	"	,
"	11	,	6	,	-0.7	,	-0.2	,	0	,	0	"	,
"	11	,	7	,	0.2	,	-2.1	,	0	,	0.1	"	,
"	11	,	8	,	1.7	,	-1.5	,	0	,	0	"	,
"	11	,	9	,	-0.2	,	-2.5	,	0	,	-0.1	"	,
"	11	,	10	,	0.4	,	-2	,	-0.1	,	0	"	,
"	11	,	11	,	3.5	,	-2.3	,	-0.1	,	-0.1	"	,
"	12	,	0	,	-2	,	0	,	0.1	,	0	"	,
"	12	,	1	,	-0.3	,	-1	,	0	,	0	"	,
"	12	,	2	,	0.4	,	0.5	,	0	,	0	"	,
"	12	,	3	,	1.3	,	1.8	,	0.1	,	-0.1	"	,
"	12	,	4	,	-0.9	,	-2.2	,	-0.1	,	0	"	,
"	12	,	5	,	0.9	,	0.3	,	0	,	0	"	,
"	12	,	6	,	0.1	,	0.7	,	0.1	,	0	"	,
"	12	,	7	,	0.5	,	-0.1	,	0	,	0	"	,
"	12	,	8	,	-0.4	,	0.3	,	0	,	0	"	,
"	12	,	9	,	-0.4	,	0.2	,	0	,	0	"	,
"	12	,	10	,	0.2	,	-0.9	,	0	,	0	"	,
"	12	,	11	,	-0.9	,	-0.2	,	0	,	0	"	,
"	12	,	12	,	0	,	0.7	,	0	,	0	"	
];

/* static variables */

/* some 13x13 2D arrays */
this.c = new Array(13); 
this.cd = new Array(13); 
this.tc = new Array(13); 
this.dp = new Array(13); 
this.k = new Array(13); 

for(var i=0; i< 13; i++)
{
    this.c[i] = new Array(13); 
    this.cd[i] = new Array(13); 
    this.tc[i] = new Array(13); 
    this.dp[i] = new Array(13); 
    this.k[i] = new Array(13); 
}

/* some 1D arrays */
this.snorm = new Array(169); 
this.sp = new Array(13); 
this.cp = new Array(13); 
this.fn = new Array(13); 
this.fm = new Array(13); 
this.pp = new Array(13); 


/* locals */

var maxdeg = 12;
var maxord;
var i,j,D1,D2,n,m;
var a,b,a2,b2,c2,a4,b4,c4,re;
var gnm,hnm,dgnm,dhnm,flnmj;
var c_str;
var c_flds;

/* INITIALIZE CONSTANTS */

maxord = maxdeg;
this.sp[0] = 0.0;
this.cp[0] = this.snorm[0] = this.pp[0] = 1.0;
this.dp[0][0] = 0.0;
a = 6378.137;
b = 6356.7523142;
re = 6371.2;
a2 = a*a;
b2 = b*b;
c2 = a2-b2;
a4 = a2*a2;
b4 = b2*b2;
c4 = a4 - b4;

/* READ WORLD MAGNETIC MODEL SPHERICAL HARMONIC COEFFICIENTS */
this.c[0][0] = 0.0;
this.cd[0][0] = 0.0;

for(i=0; i < this.coff.length; i++)
{
  c_str = this.coff[i];
  c_flds = c_str.split(",");

  n = parseInt(c_flds[0],10);   
  m = parseInt(c_flds[1],10);   
  gnm = parseFloat(c_flds[2]);
  hnm = parseFloat(c_flds[3]);
  dgnm = parseFloat(c_flds[4]);
  dhnm = parseFloat(c_flds[5]);
     
  if (m <= n)
  {
	this.c[m][n] = gnm;
	this.cd[m][n] = dgnm;
	if (m != 0) 
	{
	  this.c[n][m-1] = hnm;
	  this.cd[n][m-1] = dhnm;
	}
  }
}

/* CONVERT SCHMIDT NORMALIZED GAUSS COEFFICIENTS TO UNNORMALIZED */

this.snorm[0] = 1.0;
for (n=1; n<=maxord; n++) 
{
    this.snorm[n] = this.snorm[n-1]*(2*n-1)/n;
    j = 2;
    for (m=0,D1=1,D2=(n-m+D1)/D1; D2>0; D2--,m+=D1) 
    {
        this.k[m][n] = (((n-1)*(n-1))-(m*m))/((2*n-1)*(2*n-3));
        if (m > 0) 
        {
        flnmj = ((n-m+1)*j)/(n+m);
        this.snorm[n+m*13] = this.snorm[n+(m-1)*13]*Math.sqrt(flnmj);
        j = 1;
        this.c[n][m-1] = this.snorm[n+m*13]*this.c[n][m-1];
        this.cd[n][m-1] = this.snorm[n+m*13]*this.cd[n][m-1];
        }
        this.c[m][n] = this.snorm[n+m*13]*this.c[m][n];
        this.cd[m][n] = this.snorm[n+m*13]*this.cd[m][n];
    }
    this.fn[n] = (n+1);
    this.fm[n] = n;
}
this.k[1][1] = 0.0;
this.fm[0] = 0.0;// !!!!!! WMM C and Fortran both have a bug in that fm[0] is not initialised 

}

WorldMagneticModel.prototype.declination = function(altitudeKm, latitudeDegrees, longitudeDegrees, yearFloat){
		


/* locals */

var a = 6378.137;
var b = 6356.7523142;
var re = 6371.2;
var a2 = a*a;
var b2 = b*b;
var c2 = a2-b2;
var a4 = a2*a2;
var b4 = b2*b2;
var c4 = a4 - b4;
var D3, D4;
var dip, ti, gv, dec;
var n,m;
	  
var pi, dt, rlon, rlat, srlon, srlat, crlon, crlat,srlat2,
crlat2, q, q1, q2, ct, d,aor,ar, br, r2, bpp, par,
temp1,parp,temp2,bx,by,bz,bh,dtr,bp,bt, st,ca,sa;

var maxord = 12;
var alt = altitudeKm;
var glon = longitudeDegrees;
var glat = latitudeDegrees;

/*************************************************************************/

dt = yearFloat - 2015.0;
//if more then 5 years has passed since last epoch update then return invalid
if ((dt < 0.0) || (dt > 5.0)) 
    return -999;


pi = 3.14159265359;
dtr = pi/180.0;
rlon = glon*dtr;
rlat = glat*dtr;
srlon = Math.sin(rlon);
srlat = Math.sin(rlat);
crlon = Math.cos(rlon);
crlat = Math.cos(rlat);
srlat2 = srlat*srlat;
crlat2 = crlat*crlat;
this.sp[1] = srlon;
this.cp[1] = crlon;

/* CONVERT FROM GEODETIC COORDS. TO SPHERICAL COORDS. */

q = Math.sqrt(a2-c2*srlat2);
q1 = alt*q;
q2 = ((q1+a2)/(q1+b2))*((q1+a2)/(q1+b2));
ct = srlat/Math.sqrt(q2*crlat2+srlat2);
st = Math.sqrt(1.0-(ct*ct));
r2 = (alt*alt)+2.0*q1+(a4-c4*srlat2)/(q*q);
r = Math.sqrt(r2);
d = Math.sqrt(a2*crlat2+b2*srlat2);
ca = (alt+d)/r;
sa = c2*crlat*srlat/(r*d);

for (m=2; m<=maxord; m++)
{
    this.sp[m] = this.sp[1]*this.cp[m-1]+this.cp[1]*this.sp[m-1];
    this.cp[m] = this.cp[1]*this.cp[m-1]-this.sp[1]*this.sp[m-1];
}
     
aor = re/r;
ar = aor*aor;
br = bt = bp = bpp = 0.0;

for (n=1; n<=maxord; n++) 
{
    ar = ar*aor;
    for (m=0,D3=1,D4=(n+m+D3)/D3; D4>0; D4--,m+=D3) 
    {
        /*
           COMPUTE UNNORMALIZED ASSOCIATED LEGENDRE POLYNOMIALS
           AND DERIVATIVES VIA RECURSION RELATIONS
        */
            
          
        if (n == m) 
        {
          this.snorm[n+m*13] = st*this.snorm[n-1+(m-1)*13];
          this.dp[m][n] = st*this.dp[m-1][n-1]+ct*this.snorm[n-1+(m-1)*13];
        }
        else if (n == 1 && m == 0) 
        {
          this.snorm[n+m*13] = ct*this.snorm[n-1+m*13];
          this.dp[m][n] = ct*this.dp[m][n-1]-st*this.snorm[n-1+m*13];
        }
        else if (n > 1 && n != m) 
        {
          if (m > n-2) this.snorm[n-2+m*13] = 0.0;
          if (m > n-2) this.dp[m][n-2] = 0.0;
          this.snorm[n+m*13] = ct*this.snorm[n-1+m*13]-this.k[m][n]*this.snorm[n-2+m*13];
          this.dp[m][n] = ct*this.dp[m][n-1] - st*this.snorm[n-1+m*13]-this.k[m][n]*this.dp[m][n-2];
         }
         
        /*
        TIME ADJUST THE GAUSS COEFFICIENTS
        */
        this.tc[m][n] = this.c[m][n]+dt*this.cd[m][n];
        if (m != 0) this.tc[n][m-1] = this.c[n][m-1]+dt*this.cd[n][m-1];
        
        /*
        ACCUMULATE TERMS OF THE SPHERICAL HARMONIC EXPANSIONS
        */
        par = ar*this.snorm[n+m*13];
        if (m == 0) 
        {
            temp1 = this.tc[m][n]*this.cp[m];
            temp2 = this.tc[m][n]*this.sp[m];
        }
        else 
        {
            temp1 = this.tc[m][n]*this.cp[m]+this.tc[n][m-1]*this.sp[m];
            temp2 = this.tc[m][n]*this.sp[m]-this.tc[n][m-1]*this.cp[m];
        }
        bt = bt-ar*temp1*this.dp[m][n];
        bp += (this.fm[m]*temp2*par);
        br += (this.fn[n]*temp1*par);
        /*
        SPECIAL CASE:  NORTH/SOUTH GEOGRAPHIC POLES
        */
        if (st == 0.0 && m == 1) 
        {
            if (n == 1) this.pp[n] = this.pp[n-1];
            else this.pp[n] = this.ct*this.pp[n-1]-this.k[m][n]*this.pp[n-2];
            parp = ar*this.pp[n];
            bpp += (this.fm[m]*temp2*parp);
        }
    }
}

if (st == 0.0) 
    bp = bpp;
else 
    bp /= st;
    
/*
    ROTATE MAGNETIC VECTOR COMPONENTS FROM SPHERICAL TO
    GEODETIC COORDINATES
*/
bx = -bt*ca-br*sa;
by = bp;
bz = bt*sa-br*ca;
/*
    COMPUTE DECLINATION (DEC), INCLINATION (DIP) AND
    TOTAL INTENSITY (TI)
*/
bh = Math.sqrt((bx*bx)+(by*by));
ti = Math.sqrt((bh*bh)+(bz*bz));
dec = Math.atan2(by,bx)/dtr;
dip = Math.atan2(bz,bh)/dtr;
/*
    COMPUTE MAGNETIC GRID VARIATION IF THE CURRENT
    GEODETIC POSITION IS IN THE ARCTIC OR ANTARCTIC
    (I.E. GLAT > +55 DEGREES OR GLAT < -55 DEGREES)

    OTHERWISE, SET MAGNETIC GRID VARIATION TO -999.0
*/
gv = -999.0;
if (Math.abs(glat) >= 55.0) 
{
    if (glat > 0.0 && glon >= 0.0) gv = dec-glon;
    if (glat > 0.0 && glon < 0.0) gv = dec+Math.abs(glon);
    if (glat < 0.0 && glon >= 0.0) gv = dec+glon;
    if (glat < 0.0 && glon < 0.0) gv = dec-Math.abs(glon);
    if (gv > +180.0) gv -= 360.0;
    if (gv < -180.0) gv += 360.0;
}
      
  /* return magenetic field components as an array */
  
return [bx,by,bz,bh,ti,dec,dip,gv];
}