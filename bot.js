
const axios = require('axios')
const cheerio = require('cheerio')
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
    lastChecked: ['2020-12-17', '2020-12-10'],
    latestDates: ['h']
},
{
    CIK:"1018963",
    companyName:"ATI",
    lastChecked: ['2020-12-14', '2020-12-04'],
    latestDates: ['h']
}]

const url = "https://www.sec.gov/cgi-bin/browse-edgar?CIK="
const timer = 7200000 //2 hours

async function getData(CIK,year){
    var data = []
    await axios.get(url+CIK)
    .then((response)=> {
        //console.log(response.data)
        const $ = cheerio.load(response.data)
        const tableElements = []
        //DOMelement.class
        $('table.tableFile2 > tbody > tr > td').each((_idx, element)=>{
            //var elSplit = $(element).text().split("\n")
            tableElements.push($(element).text())
        })
        var updateData = []//where we put the dates of the latest filings
        tableElements.forEach((el)=>{
            el = el.slice(-10)
            if(el.slice(0,4) == year || el.slice(0,4) == "2020")//slice to get the year from the parsed data, which would be the first for cahracters in the string
                updateData.push(el)
        })
        data = updateData
    })
    .catch((error)=>{
        console.log(error)
        //send email of error
        var mailOptions = {
            from: 'youremail@gmail.com',//your email goes here
            to: 'myfriend@yahoo.com',
            subject: 'ERROR',
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
    setTimeout(()=>{},1000)
    return data
}

function updateCheck(year){
    companies.forEach(company =>{//get filing dates for each company
        getData(company.CIK,year)
        .then((dates)=>{
            company.latestDates = []
            company.latestDates.push(dates[0])
            company.latestDates.push(dates[1])
            //compare latest filing dates to last checked dates
            if(company.lastChecked[1] == company.latestDates[1]){
                console.log("No new filings available for: "+company.companyName)
            } else{
                //send an email notifying me of new filings with the link to them
                console.log("New filings available for: "+company.companyName)
                var mailOptions = {
                    from: 'youremail@gmail.com',//your email goes here
                    to: 'myfriend@yahoo.com',
                    subject: 'New '+company.companyName+' SEC filing',
                    text: 'There is a new '+company.companyName+' filing. Check it out: '+url+company.CIK
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

setInterval(()=> {
    //check year
    const year = new Date().getFullYear().toString()
    updateCheck(year)
}, timer)
