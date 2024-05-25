let x = "is height greater than 5"
console.log(x)
let splitX = x.split(" ")
console.log(splitX)

if (splitX[0] === "height") {
   console.log("checking for height")
}

if (splitX[1] === ">") {
   console.log("checking for >")
} else {
   console.log("checking for <")
}

if (splitX[2] === "5") {
   console.log("checking for 5")
}