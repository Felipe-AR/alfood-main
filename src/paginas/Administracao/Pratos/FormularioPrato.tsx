import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import http from "../../../http";
import ITag from "../../../interfaces/ITag";
import IRestaurante from "../../../interfaces/IRestaurante";
import IPrato from "../../../interfaces/IPrato";

const FormularioPrato = () => {
  const parametros = useParams();

  const [ehEditavel, setEhEditavel] = useState<boolean>(false);

  const [nomePrato, setNomePrato] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');

  const [tag, setTag] = useState<string>('');
  const [restaurante, setRestaurante] = useState<string>('');

  const [imagem, setImagem] = useState<File | null>(null);

  const [tags, setTags] = useState<ITag[]>([]);
  const [restaurantes, setRestaurantes] = useState<IRestaurante[]>([]);

  useEffect(() => {
    http.get<{ tags: ITag[] }>('tags/')
      .then(resposta => setTags(resposta.data.tags))
    http.get<IRestaurante[]>('restaurantes/')
      .then(resposta => setRestaurantes(resposta.data))
  }, [])

  useEffect(() => {
    if (parametros.id) {
      setEhEditavel(true);
      http.get<IPrato>(`pratos/${parametros.id}/`)
        .then(resposta => {
          setNomePrato(resposta.data.nome);
          setDescricao(resposta.data.descricao);
          setTag(resposta.data.tag);
          setRestaurante(restaurantes.find(restaurante => restaurante.id === resposta.data.restaurante)!.nome as string)
        })
    } else {
      setEhEditavel(false);
    }
  }, [parametros.id])

  const selecionarArquivo = (evento: React.ChangeEvent<HTMLInputElement>) => {
    if (evento.target.files?.length) {
      setImagem(evento.target.files[0])
    } else {
      setImagem(null);
    }
  }

  const resetarForm = () => {
    setNomePrato('');
    setDescricao('');
    setTag('');
    setRestaurante('');
  }

  const aoSubmeterForm = (evento: React.FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const formData = new FormData();
    formData.append('nome', nomePrato);
    formData.append('descricao', descricao);
    formData.append('tag', tag);
    formData.append('restaurante', restaurante);

    if (!parametros.id && imagem) {
      formData.append('imagem', imagem);
    }

    const url = parametros.id ? `pratos/${parametros.id}/` : 'pratos/';
    const method = parametros.id ? 'PUT' : 'POST';

    http.request({
      url,
      method,
      headers: { 'Content-Type': 'multipart/form/form-data' },
      data: formData
    })
      .then(() => {
        alert('Prato cadastrado com sucesso!')
        resetarForm();
      })
      .catch(erro => console.log(erro))
  }

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexGrow: 1,
    }}>
      <Typography component="h1" variant="h6">Formulário de Pratos</Typography>
      <Box component="form" sx={{ width: "100%" }} onSubmit={aoSubmeterForm}>
        <TextField
          onChange={evento => setNomePrato(evento.target.value)}
          value={nomePrato}
          label="Nome do Prato" variant="standard"
          fullWidth
          required
          margin="dense"
        />
        <TextField
          onChange={evento => setDescricao(evento.target.value)}
          value={descricao}
          label="Descrição do Prato" variant="standard"
          fullWidth
          required
          margin="dense"
        />
        <FormControl margin="dense" fullWidth>
          <InputLabel id='select-tag'>Tag</InputLabel>
          <Select labelId='select-tag' value={tag} onChange={evento => setTag(evento.target.value)} >
            {tags.map(tag => (
              <MenuItem key={tag.id} value={tag.value}>{tag.value}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl margin="dense" fullWidth>
          <InputLabel id='select-restaurante'>Restaurante</InputLabel>
          <Select labelId='select-restaurante' value={restaurante} onChange={evento => setRestaurante(evento.target.value)} >
            {restaurantes.map(restaurante => (
              <MenuItem key={restaurante.id} value={restaurante.id}>{restaurante.nome}</MenuItem>
            ))}
          </Select>
        </FormControl>

        { !ehEditavel && <input type="file" onChange={selecionarArquivo} /> }
        <Button sx={{ marginTop: 1 }} type="submit" variant="outlined" fullWidth>Cadastrar</Button>
      </Box>
    </Box>
  )
}

export default FormularioPrato;