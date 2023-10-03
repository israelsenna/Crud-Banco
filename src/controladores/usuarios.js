const pool = require("../database/conexao")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const senhaJwt = require('../senhaJwt')

const cadastrarUsuarios = async (req, res) => {
    const { nome, email, senha } = req.body
    if (!nome || !email || !senha) {
        return res.status(404).json({ mensagem: "Campos obrigatorios não preenchidos" })
    }
    try {
        const emailExiste = await pool.query('select * from usuarios where email = $1', [email])
        if (emailExiste.rowCount > 0) {
            return res.status(400).json({ mensagem: "Email já utilizado" })
        }
        const senhaCriptografada = await bcrypt.hash(senha, 10)
        const { rows } = await pool.query("insert into usuarios(nome, email, senha) values ($1,$2,$3) returning *", [nome, email, senhaCriptografada])
        const { senha: _, ...usuario } = rows[0]
        return res.status(201).json(usuario)
    } catch (error) {
        return res.status(500).json({ mensage: "Erro interno do servidor" })
    }
}

const fazerLogin = async (req, res) => {
    const { email, senha } = req.body

    try {
        const { rows, rowCount } = await pool.query('select * from usuarios where email = $1', [email])
        if (rowCount === 0) {
            return res.status(400).json({ mensagem: "Usuário e/ou senha inválido(s)." })
        }
        const { senha: senhaUsuario, ...usuario } = rows[0]
        const senhaCorreta = await bcrypt.compare(senha, senhaUsuario)
        if (!senhaCorreta) {
            return res.status(400).json({ mensagem: "Usuário e/ou senha inválido(s)." })
        }
        const token = jwt.sign({ id: usuario.id }, senhaJwt, { expiresIn: '8h' })
        return res.status(200).json({
            usuario,
            token
        })
    } catch (error) {
        return res.status(500).json({ mensage: "Erro interno do servidor" })
    }
}

const detalharUsuario = async (req, res) => {
    try {
        const { rows } = await pool.query('select * from usuarios where id=$1', [req.usuario.id])
        const { senha, ...usuario } = rows[0]
        return res.status(200).json(usuario)
    } catch (error) {
        return res.status(500).json("Erro interno do servidor")
    }

}

const alterarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body
    if (!nome || !email || !senha) {
        return res.status(404).json({ mensagem: "Campos obrigatorios não preenchidos" })
    }
    try {
        const emailExiste = await pool.query('select * from usuarios where email = $1', [email])
        if (emailExiste.rowCount > 0) {
            return res.status(400).json({ mensagem: "O e-mail informado já está sendo utilizado por outro usuário." })
        }
        const senhaCriptografada = await bcrypt.hash(senha, 10)
        const { rows } = await pool.query("update usuarios set nome=$1, email=$2, senha=$3 where id=$4 returning *", [nome, email, senhaCriptografada, req.usuario.id])
        const { senha: _, ...usuario } = rows[0]
        return res.status(204).json(usuario)
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" })
    }
}


module.exports = {
    cadastrarUsuarios,
    fazerLogin,
    detalharUsuario,
    alterarUsuario
}