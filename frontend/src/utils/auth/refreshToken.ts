export const RefreshToken1 = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const response = await fetch(
        `https://securetoken.googleapis.com/v1/token?key=AIzaSyDBt0MmnnFJNIoKp8tGSlelq4LMFWofVjU&grant_type=refresh_token&refresh_token=${refreshToken}`,
        {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'no-cors', // no-cors, *cors, same-origin
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
     await console.log(response)
    return await response.json(); // parses JSON response into native JavaScript objects
}