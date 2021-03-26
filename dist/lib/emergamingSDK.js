// Function to encrypt sent data
// function encryptPayload(data) {
//   return data;
// }

export const emergeGamingSDK = {
    startLevel: () => {
        emergeGamingSDK.endpoints.forEach(function (ep) {
            window.parent.postMessage({event: "LEVEL_START"}, ep);
        });
    },
    endLevel: (level_score) => {
        emergeGamingSDK.endpoints.forEach(function (ep, index) {
            window.parent.postMessage({event: "LEVEL_END", score: level_score}, ep);
        });
    },
    endpoints: [
        "https://arena.mtn.co.za",
        "https://staging.arena.arcadex.co",
        "https://staging.miggster.arcadex.co",
        "https://play.miggster.com",
        "https://miggster.arcadex.co",
        "http://localhost:3000"
    ]
};
