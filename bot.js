
const axios = require('axios')
const nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({//use your own credentials
    service: 'gmail',
    auth: {
      user: 'youremail@gmail.com',
      pass: 'yourpassword'
    }
})

const companies = [{
    CIK:"815556",
    companyName: "Fastenal",
    lastChecked: ["2021-03-17T14:58:12.000Z","2021-03-08T18:07:06.000Z"],//time and date filing was accepted
    latestDates: []
},
{
    CIK:"1018963",
    companyName:"ATI",
    lastChecked: ["2021-04-05T16:23:53.000Z","2021-04-05T16:17:16.000Z"],
    latestDates: []
}]

const filingsURL = "https://www.sec.gov/cgi-bin/browse-edgar?CIK="
const url = "https://data.sec.gov/submissions/"
const timer = 21600000 //6 hours in millicseconds

function fixCIK(CIK){//CIK numbers must be a length of 10 digits
    while(CIK.length != 10){
        CIK = '0'+CIK
    }
    return CIK
}

async function getData(CIK){
    var data = {
        latestDates: []
    }
    var fetchlink = url+'CIK'+fixCIK(CIK)+'.json'
    await axios.get(fetchlink)
    .then((response)=> {//get filing dates and the form types for each date
        data.latestDates = response.data.filings.recent.acceptanceDateTime.slice(0,2)
        //data.formTypes = response.data.filings.recent.form.slice(0,2)
    })
    .catch((error)=>{//if there's something wrong with the program or if the sec website is down
        console.log(error)
        //send email of error
        var mailOptions = {
            from: 'youremail@gmail.com',
            to: 'recipient@yahoo.com',
            subject: 'ERROR with SEC bot',
            text: 'The bot has ran into an error. Check the logs.'
        }
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Error email sent at: ' + new Date());
            }
        })
    })
    return data
}


function updateCheck(){
    companies.forEach(company =>{//get filing dates for each company
        getData(company.CIK)
        .then((data)=>{
            //add data company JSON
            company.latestDates = data.latestDates
            console.log('Previous Update',company.lastChecked," Recent Update:",company.latestDates);
            //compare latest filing dates to last checked dates
            if(JSON.stringify(company.lastChecked) == JSON.stringify(company.latestDates)){
                console.log("No new filings available for: "+company.companyName)
            } else if(company.latestDates[0] == undefined){//this would happen if internet connection lost
                console.log("Undefined return");
            } else{
                //send an email notifying me of new filings with the link to them
                console.log("New filings available for: "+company.companyName)
                var mailOptions = {
                    from: 'youremail@gmail.com',//your email goes here
                    to: 'myfriend@yahoo.com',
                    subject: 'New '+company.companyName+' SEC filing',
                    text: company.companyName+' released a new filing. Check it out: '+filingsURL+company.CIK
                }
                transporter.sendMail(mailOptions, function(error, info){
                    if (error) {
                    console.log(error);
                    } else {
                    console.log('Email sent at: ' + new Date());
                    }
                })
                //update the stored dates
                company.lastChecked = company.latestDates
            }
        })
        
    })
}

updateCheck()

setInterval(()=> {
    updateCheck()
}, timer)
