import cron from "cron";
import https from "https";

const job = new cron.CronJob("*/10 * * * * *", function () {
    https
        .get(process.env.API_URL, (res) => {
            if (res.statusCode === 200) console.log("GET request sent successfully to, ", process.env.API_URL, res.statusCode);
            else console.log("GET request failed", res.statusCode);
        })
        .on("error", (e) => console.error("Error while sending request", e));
});

export default job;




// import cron from "cron";
// import https from "https";

// const job = new cron.CronJob("*/14 * * * * *", function () {
//     https
//         .get(process.env.API_URL, (res) => {
//             let data = "";

//             // Read chunks of data
//             res.on("data", (chunk) => {
//                 data += chunk;
//             });

//             // Response fully received
//             res.on("end", () => {
//                 if (res.statusCode === 200) {
//                     try {
//                         const json = JSON.parse(data);
//                         console.log("Response:", json); // ✅ You now see { message: "Working..." }
//                     } catch (err) {
//                         console.error("Error parsing response JSON:", err);
//                     }
//                 } else {
//                     console.log("GET request failed", res.statusCode);
//                 }
//             });
//         })
//         .on("error", (e) => console.error("Error while sending request", e));
// });

// export default job;