/**
 * Funções de validação reaproveitadas pelos services.
 */

/** Formato de e-mail: algo@algo.algo, sem espaços (RF007, regra 2). */
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Calcula um dígito verificador do CPF: soma cada dígito multiplicado por um peso
 * que começa em pesoInicial e diminui até 2; o dígito é (soma × 10) mod 11, e 10 vira 0.
 *
 * @param {string} digitos Os 9 primeiros dígitos (para o 1º verificador) ou os 10 primeiros (para o 2º).
 * @param {number} pesoInicial 10 para o 1º verificador, 11 para o 2º.
 * @returns {number} O dígito verificador.
 */
function calcularDigitoCpf(digitos, pesoInicial) {
  const soma = [...digitos].reduce((total, digito, indice) => total + Number(digito) * (pesoInicial - indice), 0);
  return ((soma * 10) % 11) % 10;
}

/**
 * Verifica se o CPF tem 11 dígitos e os dígitos verificadores corretos (RF007, regra 1).
 * CPFs com todos os dígitos iguais (111.111.111-11) passam na conta, mas não são válidos.
 *
 * @param {string} cpf CPF só com números.
 * @returns {boolean} true se o CPF for válido.
 */
function cpfValido(cpf) {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  const primeiro = calcularDigitoCpf(cpf.slice(0, 9), 10);
  const segundo = calcularDigitoCpf(cpf.slice(0, 10), 11);
  return primeiro === Number(cpf[9]) && segundo === Number(cpf[10]);
}

/**
 * Verifica o formato do e-mail (RF007, regra 2).
 *
 * @param {string} email E-mail sem espaços nas pontas.
 * @returns {boolean} true se o formato for válido.
 */
function emailValido(email) {
  return FORMATO_EMAIL.test(email);
}

/**
 * Remove tudo que não for número: "123.456.789-09" vira "12345678909".
 *
 * @param {string} [texto] Texto digitado.
 * @returns {string} Só os dígitos.
 */
function somenteDigitos(texto) {
  return String(texto ?? '').replace(/\D/g, '');
}

module.exports = { cpfValido, emailValido, somenteDigitos };
