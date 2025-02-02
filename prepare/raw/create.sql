CREATE SCHEMA `cloud-cnpj.raw`
OPTIONS (
  location = 'us-central1'
);

CREATE TABLE `cloud-cnpj.raw.cnaes` (
    cnae STRING OPTIONS(description="Código da atividade econômica"),
    descricao STRING OPTIONS(description="Descrição da atividade econômica")
)
CLUSTER BY cnae;

CREATE TABLE `cloud-cnpj.raw.empresas` (
    cnpj_basico STRING OPTIONS(description="Número base de inscrição no CNPJ (oito primeiros dígitos do CNPJ)"),
    razao_social STRING OPTIONS(description="Nome empresarial da pessoa jurídica"),
    natureza_juridica STRING OPTIONS(description="Código da natureza jurídica"),
    qualificacao_responsavel STRING OPTIONS(description="Qualificação da pessoa física responsável pela empresa"),
    capital_social STRING OPTIONS(description="Capital social da empresa"),
    porte STRING OPTIONS(description="Código do porte da empresa: 00 - não informado, 01 - micro empresa, 03 - empresa de pequeno porte, 05 - demais"),
    ente_federativo STRING OPTIONS(description="O ente federativo responsável é preenchido para os casos de órgãos e entidades do grupo de natureza jurídica 1XXX. Para as demais naturezas, este atributo fica em branco")
)
PARTITION BY DATE(_PARTITIONTIME)
CLUSTER BY cnpj_basico;

CREATE TABLE `cloud-cnpj.raw.estabelecimentos` (
    cnpj_basico STRING OPTIONS(description="Número base de inscrição no CNPJ (oito primeiros dígitos do CNPJ)"),
    cnpj_ordem STRING OPTIONS(description="Número do estabelecimento de inscrição no CNPJ (do nono até o décimo segundo dígito do CNPJ)"),
    cnpj_dv STRING OPTIONS(description="Dígito verificador do número de inscrição no CNPJ (dois últimos dígitos do CNPJ)"),
    identificador_matriz_filial STRING OPTIONS(description="Código do identificador matriz/filial: 1 - matriz, 2 - filial"),
    nome_fantasia STRING OPTIONS(description="Corresponde ao nome fantasia"),
    situacao_cadastral STRING OPTIONS(description="Código da situação cadastral: 01 - nula, 2 - ativa, 3 - suspensa, 4 - inapta, 08 - baixada"),
    data_situacao_cadastral STRING OPTIONS(description="Data do evento da situação cadastral"),
    motivo_situacao_cadastral STRING OPTIONS(description="Código do motivo da situação cadastral"),
    nome_cidade_exterior STRING OPTIONS(description="Nome da cidade no exterior"),
    pais STRING OPTIONS(description="Código do país"),
    data_inicio_atividade STRING OPTIONS(description="Data de início da atividade"),
    cnae_fiscal_principal STRING OPTIONS(description="Código da atividade econômica principal do estabelecimento"),
    cnae_fiscal_secundaria STRING OPTIONS(description="Código da(s) atividade(s) econômica(s) secundária(s) do estabelecimento"),
    tipo_logradouro STRING OPTIONS(description="Descrição do tipo de logradouro"),
    logradouro STRING OPTIONS(description="Nome do logradouro onde se localiza o estabelecimento"),
    numero STRING OPTIONS(description="Número onde se localiza o estabelecimento. Quando não houver preenchimento do número haverá 'S/N'"),
    complemento STRING OPTIONS(description="Complemento para o endereço de localização do estabelecimento"),
    bairro STRING OPTIONS(description="Bairro onde se localiza o estabelecimento"),
    cep STRING OPTIONS(description="Código de endereço postal referente ao logradouro no qual o estabelecimento está localizado"),
    uf STRING OPTIONS(description="Sigla da unidade da federação em que se encontra o estabelecimento"),
    municipio STRING OPTIONS(description="Código do município de jurisdição onde se encontra o estabelecimento"),
    ddd1 STRING OPTIONS(description="Contém o DDD 1"),
    telefone1 STRING OPTIONS(description="Contém o número do telefone 1"),
    ddd2 STRING OPTIONS(description="Contém o DDD 2"),
    telefone2 STRING OPTIONS(description="Contém o número do telefone 2"),
    ddd_fax STRING OPTIONS(description="Contém o DDD do fax"),
    fax STRING OPTIONS(description="Contém o número do fax"),
    correio_eletronico STRING OPTIONS(description="Contém o e-mail do contribuinte"),
    situacao_especial STRING OPTIONS(description="Situação especial da empresa"),
    data_situacao_especial STRING OPTIONS(description="Data em que a empresa entrou em situação especial")
)
PARTITION BY DATE(_PARTITIONTIME)
CLUSTER BY cnpj_basico;

CREATE TABLE `cloud-cnpj.raw.motivos` (
    codigo STRING OPTIONS(description="Código identificador do motivo da situação cadastral"),
    descricao STRING OPTIONS(description="Descrição do motivo da situação cadastral")
)
CLUSTER BY codigo;

CREATE TABLE `cloud-cnpj.raw.municipios` (
    codigo STRING OPTIONS(description="Código do município"),
    descricao STRING OPTIONS(description="Nome do município")
)
CLUSTER BY codigo;

CREATE TABLE `cloud-cnpj.raw.naturezas` (
    codigo STRING OPTIONS(description="Código da natureza jurídica"),
    descricao STRING OPTIONS(description="Nome da natureza jurídica")
)
CLUSTER BY codigo;

CREATE TABLE `cloud-cnpj.raw.paises` (
    codigo STRING OPTIONS(description="Código do país"),
    descricao STRING OPTIONS(description="Nome do país")
)
CLUSTER BY codigo;

CREATE TABLE `cloud-cnpj.raw.qualificacoes` (
    codigo STRING OPTIONS(description="Código da qualificação do sócio"),
    descricao STRING OPTIONS(description="Nome da qualificação do sócio")
)
CLUSTER BY codigo;

CREATE TABLE `cloud-cnpj.raw.simples` (
    cnpj_basico STRING OPTIONS(description="Número base de inscrição no CNPJ (oito primeiros dígitos do CNPJ)"),
    opcao_pelo_simples STRING OPTIONS(description="Indicador da existência da opção pelo Simples: S - Sim, N - Não, em branco - Outros"),
    data_opcao_simples STRING OPTIONS(description="Data de opção pelo Simples"),
    data_exclusao_simples STRING OPTIONS(description="Data de exclusão do Simples"),
    opcao_pelo_mei STRING OPTIONS(description="Indicador da existência da opção pelo MEI: S - Sim, N - Não, em branco - Outros"),
    data_opcao_mei STRING OPTIONS(description="Data de opção pelo MEI"),
    data_exclusao_mei STRING OPTIONS(description="Data de exclusão do MEI")
)
PARTITION BY DATE(_PARTITIONTIME)
CLUSTER BY cnpj_basico;

CREATE TABLE `cloud-cnpj.raw.socios` (
    cnpj_basico STRING OPTIONS(description="Número base de inscrição no CNPJ (Cadastro Nacional da Pessoa Jurídica)"),
    identificador_socio STRING OPTIONS(description="Código do identificador de sócio: 1 - pessoa jurídica, 2 - pessoa física, 3 - estrangeiro"),
    nome_socio STRING OPTIONS(description="Nome do sócio pessoa física ou a razão social da pessoa jurídica e/ou nome do sócio estrangeiro"),
    cnpj_cpf_socio STRING OPTIONS(description="CPF ou CNPJ do sócio (sócio estrangeiro não tem esta informação)"),
    qualificacao_socio STRING OPTIONS(description="Código da qualificação do sócio"),
    data_entrada_sociedade STRING OPTIONS(description="Data de entrada na sociedade"),
    pais STRING OPTIONS(description="Código do país do sócio estrangeiro"),
    representante_legal STRING OPTIONS(description="Número do CPF do representante legal"),
    nome_representante STRING OPTIONS(description="Nome do representante legal"),
    qualificacao_representante STRING OPTIONS(description="Código da qualificação do representante legal"),
    faixa_etaria STRING OPTIONS(description="Código correspondente à faixa etária do sócio")
)
PARTITION BY DATE(_PARTITIONTIME)
CLUSTER BY cnpj_basico;

CREATE TABLE `cloud-cnpj.raw.portes` (
    codigo STRING OPTIONS(description="Código do porte da empresa."),
    descricao STRING OPTIONS(description="Descrição do porte da empresa.")
)
CLUSTER BY codigo;

CREATE OR REPLACE TABLE `cloud-cnpj.raw.situacoes` (
    codigo STRING OPTIONS(description="Código da situação cadastral do estabelecimento."),
    descricao STRING OPTIONS(description="Descrição da situação cadastral.")
)
CLUSTER BY codigo;

INSERT INTO `cloud-cnpj.raw.portes` (codigo, descricao) 
VALUES
    (NULL, 'Não informado'),
    ('', 'Não informado'),
    ('00', 'Não informado'),
    ('01', 'Microempresa (ME)'),
    ('03', 'Empresa de Pequeno Porte (EPP)'),
    ('05', 'Demais empresas');

INSERT INTO `cloud-cnpj.raw.situacoes` (codigo, descricao) 
VALUES
    ('01', 'Nula'),
    ('02', 'Ativa'),
    ('03', 'Suspensa'),
    ('04', 'Inapta'),
    ('08', 'Baixada');