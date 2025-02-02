with

-- obter os CNAEs principal e secundários dos estabelecimentos
cnaes as (
  select
    e.cnpj_basico,
    e.cnpj_ordem,
    e.cnpj_dv,
    struct(
      cp.cnae as codigo,
      cp.descricao
    ) as principal,
    array_agg(
      struct (
        cs.cnae as codigo,
        cs.descricao 
      )
    ) as secundarios
  from
    `cloud-cnpj.raw.estabelecimentos` as e
  left join
    unnest(coalesce(
      split(e.cnae_fiscal_secundaria, ','),
      array<string>[]
    )) as cnaes
  left join
    `cloud-cnpj.raw.cnaes` as cp on (e.cnae_fiscal_principal = cp.cnae)
  left join
    `cloud-cnpj.raw.cnaes` as cs on (cnaes = cs.cnae)
  group by
    e.cnpj_basico,
    e.cnpj_ordem,
    e.cnpj_dv,
    cp.cnae,
    cp.descricao
),

-- obter os sócios das empresas
socios as (
  select
    s.cnpj_basico,
    array_agg(
      struct (
        nullif(cnpj_cpf_socio, '') as cnpj_cpf,
        nullif(nome_socio, '') as nome,
        safe.parse_date('%Y%m%d', s.data_entrada_sociedade) as data_entrada,
        faixa_etaria,
        struct(
          cast(identificador_socio as int64) as codigo,
          case
            when identificador_socio = '1' then 'PESSOA JURÍDICA'
            when identificador_socio = '2' then 'PESSOA FÍSICA'
            when identificador_socio = '3' then 'ESTRANGEIRO'
            else null
          end as descricao
        ) as identificador,
        struct(
          q.codigo,
          q.descricao
        ) as qualificacao,
        struct(
          representante_legal as cpf,
          nullif(nome_representante, '') as nome,
          struct(
            qr.codigo,
            qr.descricao
          ) as qualificacao
        ) as representante_legal,
        struct(
          p.codigo,
          p.descricao
        ) as pais_exterior
      )
    ) as socios
  from
    `cloud-cnpj.raw.socios` as s
  left join
    `cloud-cnpj.raw.qualificacoes` as q on (s.qualificacao_socio = q.codigo)
  left join
    `cloud-cnpj.raw.paises` as p on (s.pais = p.codigo)
  left join
    `cloud-cnpj.raw.qualificacoes` as qr on (s.qualificacao_representante = qr.codigo)
  group by
    s.cnpj_basico
),

-- obter as informações das empresas
empresas as (
  select
    e.cnpj_basico,
    e.razao_social,
    round(cast(replace(e.capital_social, ',', '.') as numeric), 2) as capital_social,
    nullif(e.ente_federativo, '') as ente_federativo,
    struct(nullif(p.codigo, '') as codigo, p.descricao) AS porte,
    struct(n.codigo, n.descricao) AS natureza_juridica,
    struct(q.codigo, q.descricao) AS qualificacao_responsavel,
    struct(
      (ifnull(sp.opcao_pelo_simples, 'N') = 'S') as opcao,
      safe.parse_date('%Y%m%d', sp.data_opcao_simples) as data_opcao,
      safe.parse_date('%Y%m%d', sp.data_exclusao_simples) as data_exclusao
    ) as simples,
    struct(
      (ifnull(sp.opcao_pelo_mei, 'N') = 'S') as opcao,
      safe.parse_date('%Y%m%d', sp.data_opcao_mei) as data_opcao,
      safe.parse_date('%Y%m%d', sp.data_exclusao_mei) as data_exclusao
    ) as mei,
    sc.socios
  from
    `cloud-cnpj.raw.empresas` as e
  left join
    `cloud-cnpj.raw.naturezas` as n on (e.natureza_juridica = n.codigo)
  left join
    `cloud-cnpj.raw.qualificacoes` as q on (e.qualificacao_responsavel = q.codigo)
  left join
    `cloud-cnpj.raw.portes` as p on (e.porte = p.codigo)
  left join
    `cloud-cnpj.raw.simples` as sp on (e.cnpj_basico = sp.cnpj_basico)
  left join
    socios as sc on (e.cnpj_basico = sc.cnpj_basico)
),

-- obter os estabelecimentos e suas informações detalhadas
estabelecimentos as (
  select
    concat(et.cnpj_basico, et.cnpj_ordem, et.cnpj_dv) as cnpj,
    et.cnpj_basico,
    et.cnpj_ordem,
    et.cnpj_dv,
    safe.parse_date('%Y%m%d', et.data_inicio_atividade) as data_inicio_atividade,
    ep.razao_social,
    nullif(et.nome_fantasia, '') as nome_fantasia,
    ep.capital_social,
    ep.ente_federativo,
    struct(
      et.identificador_matriz_filial as codigo,
      if(et.identificador_matriz_filial = '1', 'Matriz', 'Filial') as descricao
    ) as matriz_filial,
    struct(
      s.codigo,
      s.descricao,
      safe.parse_date('%Y%m%d', et.data_situacao_cadastral) as `data`
    ) as situacao_cadastral,
    struct(
      mt.codigo,
      mt.descricao
    ) as motivo_situacao_cadastral,
    struct(
      cast(null as string) as codigo,
      nullif(et.situacao_especial, '') as descricao,
      safe.parse_date('%Y%m%d', et.data_situacao_especial) as `data`
    ) as situacao_especial,
    ep.porte,
    ep.natureza_juridica,
    struct(
      struct(
        cast(null as string) as codigo,
        nullif(et.nome_cidade_exterior, '') as descricao
      ) as cidade,
      struct(
        p.codigo,
        p.descricao
      ) as pais
    ) as exterior,
    struct(
      c.principal,
      c.secundarios
    ) as cnaes,
    ep.qualificacao_responsavel,
    ep.simples,
    ep.mei,
    struct(
      nullif(et.tipo_logradouro, '') as tipo_logradouro,
      nullif(et.logradouro, '') as logradouro,
      et.numero,
      nullif(et.complemento, '') as complemento,
      nullif(et.bairro, '') as bairro,
      nullif(et.cep, '') as cep,
      mn.descricao as municipio,
      et.uf
    ) as endereco,
    struct(
      nullif(et.ddd1, '') as ddd,
      nullif(et.telefone1, '') as telefone
    ) as telefone1,
    struct(
      nullif(et.ddd2, '') as ddd,
      nullif(et.telefone2, '') as telefone
    ) as telefone2,
    struct(
      nullif(et.ddd_fax, '') as ddd,
      nullif(et.fax, '') as telefone
    ) as fax,
    nullif(et.correio_eletronico, '') as email,
    ep.socios
  from
    `cloud-cnpj.raw.estabelecimentos` as et
  left join
    `cloud-cnpj.raw.situacoes` as s on (et.situacao_cadastral = s.codigo)
  left join
    `cloud-cnpj.raw.motivos` as mt on (et.motivo_situacao_cadastral = mt.codigo)
  left join
    `cloud-cnpj.raw.paises` as p on (et.pais = p.codigo)
  left join
    `cloud-cnpj.raw.municipios` as mn on (et.municipio = mn.codigo)
  left join
    cnaes as c on (et.cnpj_basico = c.cnpj_basico and et.cnpj_ordem = c.cnpj_ordem and et.cnpj_dv = c.cnpj_dv)
  left join
    empresas as ep on (et.cnpj_basico = ep.cnpj_basico)
)

select * from estabelecimentos
