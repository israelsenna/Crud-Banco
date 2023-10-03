const express = require("express")
const { cadastrarUsuarios, fazerLogin, detalharUsuario, alterarUsuario } = require("./controladores/usuarios")
const verificaLogin = require("./intermediarios/verificaLogin")
const { cadastrarTransacao, listarTransacoes, listarTransacoesPorID, editarTransacaoPorId, excluirTransacaoPorId, exibirExtratoPorId, filtrarCategoria } = require("./controladores/transacoes")
const { mostrarCategorias } = require("./controladores/categorias")
const rotas = express()

rotas.post("/usuarios", cadastrarUsuarios)
rotas.post("/login", fazerLogin)

rotas.use(verificaLogin)

rotas.get('/usuario', detalharUsuario)
rotas.put('/usuario', alterarUsuario)
rotas.get('/categorias', mostrarCategorias)
rotas.get('/transacao', listarTransacoes, filtrarCategoria)
rotas.get('/transacao/extrato', exibirExtratoPorId)
rotas.get('/transacao/:id', listarTransacoesPorID)
rotas.post('/transacao', cadastrarTransacao)
rotas.put('/transacao/:id', editarTransacaoPorId)
rotas.delete('/transacao/:id', excluirTransacaoPorId)

module.exports = rotas