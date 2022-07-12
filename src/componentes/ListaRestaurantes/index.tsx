import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import axios, { AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import { IPaginacao } from "../../interfaces/IPaginacao";
import IRestaurante from "../../interfaces/IRestaurante";
import style from "./ListaRestaurantes.module.scss";
import Restaurante from "./Restaurante";

interface IParametrosBusca {
  ordering?: string;
  search?: string;
}

const ListaRestaurantes = () => {
  const [restaurantes, setRestaurantes] = useState<IRestaurante[]>([]);
  const [proximaPagina, setProximaPagina] = useState<string>("");
  const [paginaAnterior, setPaginaAnterior] = useState<string>("");
  const [busca, setBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState('');

  const carregarDados = (url: string, opcoes?: AxiosRequestConfig) => {
    axios.get<IPaginacao<IRestaurante>>(url, opcoes)
      .then((resposta) => {
        setRestaurantes(resposta.data.results)
        setPaginaAnterior(resposta.data.previous);
        setProximaPagina(resposta.data.next);
      })
      .catch(erro => console.log(erro));
  }

  const buscar = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const opcoes = { params: {} as IParametrosBusca }
    if (busca)
      opcoes.params.search = busca
    if (ordenacao)
      opcoes.params.ordering = ordenacao
    carregarDados('http://localhost:8000/api/v1/restaurantes/', opcoes);
  }

  useEffect(() => {
    carregarDados("http://localhost:8000/api/v1/restaurantes/")
  }, []);

  return (
    <section className={style.ListaRestaurantes}>
      <h1>Os restaurantes mais <em>bacanas</em>!</h1>
      <Box component="form" onSubmit={buscar} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <TextField variant="filled" label="Busca" value={busca} onChange={evento => setBusca(evento.target.value)}/>
        <FormControl variant="filled" sx={{ minWidth: 120 }}>
          <InputLabel id="select-ordenacao">Ordenação</InputLabel>
          <Select labelId="select-ordenacao" value={ordenacao} onChange={evento => setOrdenacao(evento.target.value)}>
            <MenuItem value="">Padrão</MenuItem>
            <MenuItem value="id">Por ID</MenuItem>
            <MenuItem value="nome">Por Nome</MenuItem>
          </Select>
        </FormControl>
        <Button type="submit" variant="contained">Buscar</Button>
      </Box>
      {restaurantes.map((item) => (<Restaurante restaurante={item} key={item.id} />))}
      <div style={{ marginTop: "10px" }}>
        <Button onClick={() => carregarDados(paginaAnterior)} disabled={!paginaAnterior} variant="outlined">Página Anterior</Button>
        <Button onClick={() => carregarDados(proximaPagina)} disabled={!proximaPagina} variant="outlined">Próxima Página</Button>
      </div>
    </section>
  );
};

export default ListaRestaurantes;