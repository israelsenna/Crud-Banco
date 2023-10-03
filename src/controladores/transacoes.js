const pool = require("../database/conexao")

const cadastrarTransacao = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.json({ mensagem: "Todos os campos obrigatórios devem ser informados." })
    }

    try {
        const existeCategoria = await pool.query('select * from categorias ')
        if (existeCategoria.rowCount < categoria_id) {
            return res.status(400).json({ mensagem: "Não existe esta categoria." })
        }

        if (tipo === 'entrada' || tipo === 'saida') {
            const inserir = await pool.query('insert into transacoes (descricao, valor, data, categoria_id, usuario_id, tipo) values ($1,$2,$3,$4,$5,$6) returning id', [descricao, valor, data, categoria_id, req.usuario.id, tipo])
            const resposta = await pool.query('SELECT a.*, b.descricao as categoria_nome FROM transacoes as A LEFT JOIN categorias as B on a.categoria_id = b.id where a.id=$1', [inserir.rows[0].id])
            return res.status(201).json(resposta.rows[0])
        } else {
            return res.status(400).json({ mensagem: "Tipo inválido." })
        }

    } catch (error) {
        return res.json({ mensagem: "Erro interno do servidor" })
    }

}

const listarTransacoes = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT a.*, b.descricao as categoria_nome FROM transacoes as A LEFT JOIN categorias as B on a.categoria_id = b.id where usuario_id=$1', [req.usuario.id])
        return res.status(200).json(rows)
    } catch (error) {
        return res.status(500).json("Erro interno do servidor")
    }
}

const listarTransacoesPorID = async (req, res) => {
    const { id } = req.params

    try {
        const checarTransacao = await pool.query('SELECT a.*, b.descricao as categoria_nome FROM transacoes as A LEFT JOIN categorias as B on a.categoria_id = b.id where usuario_id=$1 and a.id=$2', [req.usuario.id, id])

        if (checarTransacao.rowCount === 0) {
            return res.status(400).json({ mensagem: "Transação não encontrada." })
        }

        return res.status(200).json(checarTransacao.rows)

    } catch (error) {
        return res.status(500).json("Erro interno do servidor")
    }
}

const editarTransacaoPorId = async (req, res) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body
    const { id } = req.params
    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return res.json({ mensagem: "Todos os campos obrigatórios devem ser informados" })
    }

    try {
        const selecionar = await pool.query("select * from transacoes where id=$1 and usuario_id=$2", [id, req.usuario.id])

        if (selecionar.rowCount === 0) {
            return res.status(404).json({ mensagem: "Não é possível alterar transação" })
        }
        const existeCategoria = await pool.query('select * from categorias ')
        if (existeCategoria.rowCount < categoria_id) {
            return res.status(400).json({ mensagem: "Não existe esta categoria." })
        }

        if (tipo === 'entrada' || tipo === 'saida') {
            const alterarTransacao = await pool.query("update transacoes set descricao=$1, valor=$2, data=$3, categoria_id=$4, tipo=$5 where id=$6 and usuario_id=$7 returning *", [descricao, valor, data, categoria_id, tipo, id, req.usuario.id])
            return res.status(204).json()
        } else {
            return res.status(400).json({ mensagem: "Tipo inválido." })
        }
    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" })
    }
}


const excluirTransacaoPorId = async (req, res) => {
    const { id } = req.params

    try {
        const selecionar = await pool.query("select * from transacoes where id=$1 and usuario_id=$2", [id, req.usuario.id])

        if (selecionar) {
            const deletarTransacao = await pool.query("delete from transacoes where id=$1 and usuario_id=$2", [id, req.usuario.id])
            return res.status(204).json()
        } else {
            return res.status(404).json({ mensagem: "Transação não encontrada." })
        }

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" })
    }
}


const exibirExtratoPorId = async (req, res) => {
    try {
        let entrada = await pool.query("select sum(valor) from transacoes where tipo ='entrada' and usuario_id = $1", [req.usuario.id])
        let saida = await pool.query("select sum(valor) from transacoes where tipo ='saida' and usuario_id = $1", [req.usuario.id])

        somaEntrada = entrada.rows[0]

        somaSaida = saida.rows[0]

        if (somaEntrada.sum === null) {
            somaEntrada.sum = 0
        }

        if (somaSaida.sum === null) {
            somaSaida.sum = 0
        }

        return res.status(200).json({ "entrada": somaEntrada.sum, "saida": somaSaida.sum })

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" })
    }

}

const filtrarCategoria = async (req, res) => {
    const { filtro } = req.query

    try {
        let aux = []

        for (let i = 0; i < filtro.length; i++) {
            const filtros = filtro[i]

            const acheiCategoria = await pool.query("select * from categorias where descricao=$1", [filtros])
            const selecionar = await pool.query("SELECT a.*, b.descricao as categoria_nome FROM transacoes as A LEFT JOIN categorias as B on a.categoria_id = b.id where usuario_id=$1 and categoria_id=$2", [req.usuario.id, acheiCategoria.rows[0].id])

            aux.push(selecionar.rows)
        }

        let array = aux.reduce(function reduce(acumulador, valorAtual) {
            return acumulador.concat(valorAtual)
        })
        return res.status(200).json(array)

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro interno do servidor" })
    }
}

module.exports = {
    cadastrarTransacao,
    listarTransacoes,
    listarTransacoesPorID,
    editarTransacaoPorId,
    excluirTransacaoPorId,
    exibirExtratoPorId,
    filtrarCategoria
}