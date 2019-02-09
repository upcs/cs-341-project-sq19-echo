function calculateSum(){
  var x = document.getElementById("firstNum").value;
  var y = document.getElementById("secondNum").value;
  document.getElementById("output").innerHTML = sum(x,y);
} //writes the sum of the two inputs to output