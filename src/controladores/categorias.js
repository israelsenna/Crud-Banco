const pool = require("../database/conexao")

const mostrarCategorias = async (req, res) => {
    try {
        const { rows } = await pool.query('select * from categorias')
        return res.status(200).json(rows)
    } catch (error) {
        return res.status(500).json("Erro interno do servidor")
    }

}

module.exports = {
    mostrarCategorias
}