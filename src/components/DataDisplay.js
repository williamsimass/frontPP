import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Pagination, Spin, Input, Modal, Checkbox, Row, Col } from 'antd';
import * as XLSX from 'xlsx';
import FiltroAvancadoButton from './buttons/FiltroAvancadoButton';
import GerarRelatorioButton from './buttons/GerarRelatorioButton';
import UploadButton from './buttons/UploadButton';

const DataDisplay = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterText, setFilterText] = useState('');
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://projeto-dados.onrender.com/api/dados');
        setData(response.data);
        setFilteredData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterText(value);
    const filtered = data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const handleCapsLockCheck = (e) => {
    const isCapsLockOn = e.getModifierState && e.getModifierState('CapsLock');
    setCapsLockOn(isCapsLockOn);
  };

  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columnsOptions = [
    { label: 'Envolvido', value: 'ENVOLVIDO' },
    { label: 'Processo Judicial', value: 'PROCESSO_JUDICIAL' },
    { label: 'Autor Falecido', value: 'AUTOR_FALECIDO' },
    { label: 'Ano do Óbito', value: 'ANO_DO_OBITO' },
    { label: 'Tipo de Procuração', value: 'TIPO_DE_PROCURACAO' },
    { label: 'Se Analfabeto, Nome Pessoa Assinou/Rogo', value: 'SE_ANALFABETO_NOME_PESSOA_ASSINOU_ROGO' },
    { label: 'Se Analfabeto, Testemunha 1', value: 'SE_ANALFABETO_TESTEMUNHA_1' },
    { label: 'Se Analfabeto, Testemunha 2', value: 'SE_ANALFABETO_TESTEMUNHA_2' },
    { label: 'Tipo de Comprovante', value: 'TIPO_DE_COMPROVANTE' },
    { label: 'Nome de Terceiro?', value: 'NOME_DE_TERCEIRO' },
    { label: 'Se Sim, Qual Nome Terceiro', value: 'SE_SIM_QUAL_NOME_TERCEIRO' },
    { label: 'Número da Linha/Medidor/Hidrômetro', value: 'NUMERO_LINHA_MEDIDOR_HIDROMETRO' },
    { label: 'Código Cliente/Usuário/Matrícula', value: 'CODIGO_CLIENTE_USUARIO_MATRICULA' },
    { label: 'Número do Contrato/Conta', value: 'NUMERO_CONTRATO_CONTA' },
    { label: 'Número da Fatura/Nota Fiscal', value: 'NUMERO_FATURA_NOTA_FISCAL' },
    { label: 'Código Débito Automático', value: 'CODIGO_DEBITO_AUTOMATICO' },
    { label: 'Código de Barras', value: 'CODIGO_BARRAS' },
    { label: 'Valor da Fatura', value: 'VALOR_FATURA' },
    { label: 'Comprovante de Residência com Suspeita de Fraude', value: 'COMPROVANTE_RESIDENCIA_COM_SUSPEITA_DE_FRAUDE' },
    { label: 'Advogado ou Parte Não Compareceram à Audiência', value: 'ADVOGADO_OU_PARTE_NAO_COMPARECERAM_A_AUDIECIA' },
    { label: 'Decisões com Aplicação de Multa por Litigância de Má-fé', value: 'HA_DECISOES_COM_APLICACAO_DE_MULTA_POR_LITIGANCIA_DE_MA_FE' },
    { label: 'Decisões com Expedição de Ofício', value: 'HA_DECISOES_COM_EXPEDICAO_DE_OFICIO' },
    { label: 'A Parte Alegou Desconhecer Ação e/ou Advogado', value: 'A_PARTE_ALEGA_DESCONHECER_ACAO_E_OU_ADVOGADO' },
    { label: 'Decisão que Faz Menção à Litigância Predatória', value: 'HA_DECISAO_QUE_FAZ_MENCAO_A_LITIGANCIA_PREDATORIA' },
    { label: 'Observações', value: 'OBSERVACOES' },
    { label: 'Advogado da Parte', value: 'ADVOGADO_PARTE' },
    { label: 'Análise', value: 'ANALISE' },
  ];
  

  const handleCheckboxChange = (checkedValues) => {
    setSelectedColumns(checkedValues);
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    if (checked) {
      setSelectedColumns(columnsOptions.map(col => col.value));
    } else {
      setSelectedColumns([]);
    }
    setSelectAll(checked);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleApplyFilters = () => {
    setIsModalVisible(false);
  };

  const showConfirmModal = () => {
    setIsConfirmModalVisible(true);
  };

  const handleConfirmCancel = () => {
    setIsConfirmModalVisible(false);
  };

  const handleConfirmOk = () => {
    generateReport();
    setIsConfirmModalVisible(false);
  };

  const generateReport = () => {
    const filteredColumns = columnsOptions.filter(column => 
      selectedColumns.includes(column.value)
    );

    const ws = XLSX.utils.json_to_sheet(filteredData.map(item => {
      let result = {};
      selectedColumns.forEach(col => {
        result[columnsOptions.find(option => option.value === col)?.label] = item[col];
      });
      return result;
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, "relatorio.xlsx");
  };

  const filteredColumns = columnsOptions.filter(column => 
    selectedColumns.includes(column.value)
  ).map(col => ({
    title: col.label,
    dataIndex: col.value,
    key: col.value
  }));

  if (loading) return <Spin size="large" />;

  return (
    <div>
      <h1>Dados do Banco de Dados</h1>

      {/* Campo de Filtro Rápido */}
      <Input
        placeholder="Filtrar dados..."
        value={filterText}
        onChange={handleFilterChange}
        onKeyUp={handleCapsLockCheck}
        style={{ marginBottom: '16px' }}
      />

      {/* Botões separados */}
      <FiltroAvancadoButton onClick={showModal} />
      <GerarRelatorioButton onClick={showConfirmModal} />
      

      {/* Modal para selecionar colunas */}
      <Modal
        title="Filtros Avançados"
        visible={isModalVisible}
        onOk={handleApplyFilters}
        onCancel={handleCancel}
        width={600}
      >
        <Checkbox
          indeterminate={selectedColumns.length > 0 && selectedColumns.length < columnsOptions.length}
          checked={selectAll}
          onChange={handleSelectAllChange}
          style={{ marginBottom: '16px', display: 'block' }}
        >
          Selecionar Todos
        </Checkbox>
        <Row gutter={[16, 16]}>
          {columnsOptions.map(option => (
            <Col span={12} key={option.value}>
              <Checkbox
                value={option.value}
                checked={selectedColumns.includes(option.value)}
                onChange={(e) => handleCheckboxChange(
                  e.target.checked
                    ? [...selectedColumns, e.target.value]
                    : selectedColumns.filter(col => col !== e.target.value)
                )}
              >
                {option.label}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* Modal de confirmação */}
      <Modal
        title="Confirmar Geração de Relatório"
        visible={isConfirmModalVisible}
        onOk={handleConfirmOk}
        onCancel={handleConfirmCancel}
        okText="Gerar e Baixar"
        cancelText="Cancelar"
      >
        <p>Você tem certeza de que deseja gerar e baixar o relatório com as colunas selecionadas?</p>
      </Modal>

      {/* Tabela de Dados */}
      <div style={{ overflowX: 'auto' }}>
        <Table
          dataSource={paginatedData}
          columns={filteredColumns.length ? filteredColumns : columnsOptions.map(col => ({
            title: col.label,
            dataIndex: col.value,
            key: col.value
          }))}
          pagination={false} 
          scroll={{ x: 'max-content' }} 
        />
      </div>

      {/* Paginação */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredData.length}
        onChange={handlePaginationChange}
        style={{ marginTop: '16px' }}
      />
    </div>
  );
};

export default DataDisplay;
