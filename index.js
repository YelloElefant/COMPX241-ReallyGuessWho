function getOporatorFunction(oporator) {
   switch (oporator) {
      case ">":
         return (a, b) => a > b;
      case "<":
         return (a, b) => a < b;
      case "=":
         return (a, b) => a == b;
      default:
         return (a, b) => a == b;
   }
}


let opfunc = getOporatorFunction(">");
console.log(opfunc(5, 3));