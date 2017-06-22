module.exports.dobra = function(a) {
  var valor = 10 / Number(a);
  if (isFinite(valor))
    return valor;
  else
    return "Erro, divisão por zero!!!";
}
