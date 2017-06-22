module.exports.ehPrimo = function (n) {
  var prim = Number(n);
  var count = 0;
  if (prim > 1) {
    for (var i = 2; i < prim; i++) {
      if (prim % i === 0) count++;
    }
    return "numero de divisoes = "+count;
  }
  return "não houve divisões";
}
