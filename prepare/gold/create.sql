CREATE SCHEMA `cloud-cnpj.gold`
OPTIONS (
  location = 'us-central1'
);

CREATE OR REPLACE TABLE `cloud-cnpj.gold.estabelecimentos` (
  cnpj STRING OPTIONS(description="Número completo do CNPJ (14 dígitos)."),
  cnpj_basico STRING OPTIONS(description="Número base do CNPJ (8 primeiros dígitos)."),
  cnpj_ordem STRING OPTIONS(description="Número de ordem do estabelecimento no CNPJ."),
  cnpj_dv STRING OPTIONS(description="Dígito verificador do CNPJ."),
  data_inicio_atividade DATE OPTIONS(description="Data de início da atividade do estabelecimento."),
  razao_social STRING OPTIONS(description="Nome empresarial da empresa."),
  nome_fantasia STRING OPTIONS(description="Nome fantasia do estabelecimento."),
  capital_social NUMERIC OPTIONS(description="Capital social da empresa"),
  ente_federativo STRING OPTIONS(description="Ente federativo responsável, se aplicável."),
  matriz_filial STRUCT<
    codigo STRING OPTIONS(description="Código identificador do estabelecimento: 1 - Matriz, 2 - Filial."),
    descricao STRING OPTIONS(description="Descrição se o estabelecimento é Matriz ou Filial.")
  > OPTIONS(description="Identificação se o estabelecimento é Matriz ou Filial."),
  situacao_cadastral STRUCT<
    codigo STRING OPTIONS(description="Código da situação cadastral do estabelecimento."),
    descricao STRING OPTIONS(description="Descrição da situação cadastral."),
    `data` DATE OPTIONS(description="Data da última atualização da situação cadastral.")
  > OPTIONS(description="Situação cadastral do estabelecimento."),
  motivo_situacao_cadastral STRUCT<
    codigo STRING OPTIONS(description="Código do motivo da situação cadastral."),
    descricao STRING OPTIONS(description="Descrição do motivo da situação cadastral.")
  > OPTIONS(description="Motivo pelo qual o estabelecimento tem determinada situação cadastral."),
  situacao_especial STRUCT<
    codigo STRING OPTIONS(description="Código da situação especial do estabelecimento."),
    descricao STRING OPTIONS(description="Descrição da situação especial."),
    `data` DATE OPTIONS(description="Data da última atualização da situação especial.")
  > OPTIONS(description="Situação especial do estabelecimento."),
  porte STRUCT<
    codigo STRING OPTIONS(description="Código do porte da empresa."),
    descricao STRING OPTIONS(description="Descrição do porte da empresa.")
  > OPTIONS(description="Porte da empresa à qual o estabelecimento pertence."),
  natureza_juridica STRUCT<
    codigo STRING OPTIONS(description="Código da natureza jurídica."),
    descricao STRING OPTIONS(description="Descrição da natureza jurídica.")
  > OPTIONS(description="Natureza jurídica da empresa à qual o estabelecimento pertence."),
  exterior STRUCT<
    cidade STRUCT<
      codigo STRING OPTIONS(description="Código da cidade no exterior."),
      descricao STRING OPTIONS(description="Nome da cidade no exterior.")
    > OPTIONS(description="Cidade no exterior, se aplicável."),
    pais STRUCT<
      codigo STRING OPTIONS(description="Código do país."),
      descricao STRING OPTIONS(description="Nome do país.")
    > OPTIONS(description="País onde o estabelecimento está localizado, se aplicável.")
  > OPTIONS(description="Informações sobre localização do estabelecimento no exterior."),
  cnaes STRUCT<
    principal STRUCT<
      codigo STRING OPTIONS(description="Código CNAE da atividade econômica principal."),
      descricao STRING OPTIONS(description="Descrição da atividade econômica principal.")
    > OPTIONS(description="Atividade econômica principal do estabelecimento."),
    secundarios ARRAY<STRUCT<
      codigo STRING OPTIONS(description="Código CNAE secundário."),
      descricao STRING OPTIONS(description="Descrição da atividade econômica secundária.")
    >> OPTIONS(description="Lista de atividades econômicas secundárias do estabelecimento.")
  > OPTIONS(description="Atividades econômicas do estabelecimento."),
  qualificacao_responsavel STRUCT<
    codigo STRING OPTIONS(description="Código da qualificação do responsável."),
    descricao STRING OPTIONS(description="Descrição da qualificação do responsável.")
  > OPTIONS(description="Qualificação do responsável pelo estabelecimento."),
  simples STRUCT<
    opcao BOOL OPTIONS(description="Indica se o estabelecimento é optante pelo Simples Nacional."),
    data_opcao DATE OPTIONS(description="Data de adesão ao Simples Nacional."),
    data_exclusao DATE OPTIONS(description="Data de exclusão do Simples Nacional.")
  > OPTIONS(description="Informações sobre a opção pelo Simples Nacional."),
  mei STRUCT<
    opcao BOOL OPTIONS(description="Indica se o estabelecimento é optante pelo MEI."),
    data_opcao DATE OPTIONS(description="Data de adesão ao MEI."),
    data_exclusao DATE OPTIONS(description="Data de exclusão do MEI.")
  > OPTIONS(description="Informações sobre a opção pelo MEI."),
  endereco STRUCT<
    tipo_logradouro STRING OPTIONS(description="Tipo de logradouro do estabelecimento."),
    logradouro STRING OPTIONS(description="Nome do logradouro do estabelecimento."),
    numero STRING OPTIONS(description="Número do estabelecimento."),
    complemento STRING OPTIONS(description="Complemento do endereço do estabelecimento."),
    bairro STRING OPTIONS(description="Bairro do estabelecimento."),
    cep STRING OPTIONS(description="CEP do estabelecimento."),
    municipio STRING OPTIONS(description="Nome do município do estabelecimento."),
    uf STRING OPTIONS(description="Unidade da Federação do estabelecimento.")
  > OPTIONS(description="Endereço do estabelecimento."),
  telefone1 STRUCT<
    ddd STRING OPTIONS(description="DDD do telefone 1."),
    telefone STRING OPTIONS(description="Número do telefone 1.")
  > OPTIONS(description="Primeiro telefone de contato do estabelecimento."),
  telefone2 STRUCT<
    ddd STRING OPTIONS(description="DDD do telefone 2."),
    telefone STRING OPTIONS(description="Número do telefone 2.")
  > OPTIONS(description="Segundo telefone de contato do estabelecimento."),
  fax STRUCT<
    ddd STRING OPTIONS(description="DDD do fax."),
    telefone STRING OPTIONS(description="Número do fax.")
  > OPTIONS(description="Número do fax do estabelecimento."),
  email STRING OPTIONS(description="E-mail de contato do estabelecimento."),
  socios ARRAY<STRUCT<
    cnpj_cpf STRING OPTIONS(description="CPF ou CNPJ do sócio."),
    nome STRING OPTIONS(description="Nome do sócio."),
    data_entrada DATE OPTIONS(description="Data de entrada do sócio na empresa."),
    faixa_etaria STRING OPTIONS(description="Faixa etária do sócio."),
    identificador STRUCT<
      codigo INT64 OPTIONS(description="Código do identificador de sócio."),
      descricao STRING OPTIONS(description="Descrição do identificador de sócio.")
    > OPTIONS(description="Tipo de sócio."),
    qualificacao STRUCT<
      codigo STRING OPTIONS(description="Código da qualificação do sócio."),
      descricao STRING OPTIONS(description="Descrição da qualificação do sócio.")
    > OPTIONS(description="Qualificação do sócio."),
    representante_legal STRUCT<
      cpf STRING OPTIONS(description="CPF do representante legal."),
      nome STRING OPTIONS(description="Nome do representante legal."),
      qualificacao STRUCT<
        codigo STRING OPTIONS(description="Código da qualificação do representante legal."),
        descricao STRING OPTIONS(description="Descrição da qualificação do representante legal.")
      > OPTIONS(description="Qualificação do representante legal.")
    > OPTIONS(description="Representante legal do sócio."),
    pais_exterior STRUCT<
      codigo STRING OPTIONS(description="Código do país do sócio estrangeiro."),
      descricao STRING OPTIONS(description="Nome do país do sócio estrangeiro.")
    > OPTIONS(description="País do sócio estrangeiro, se aplicável.")
  >> OPTIONS(description="Lista de sócios vinculados ao estabelecimento."),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP OPTIONS(description="Data e hora de criação do registro")
)
CLUSTER BY cnpj;
