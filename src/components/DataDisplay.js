import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Pagination, Spin, Input, Modal, Checkbox, Row, Col, message } from 'antd';
import * as XLSX from 'xlsx';
import FiltroAvancadoButton from './buttons/FiltroAvancadoButton'; // Verifique o caminho aqui
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
  const [filteredColumns, setFilteredColumns] = useState([]);

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

  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columnsOptions = [
    { label: 'Envolvido', value: 'envolvido' },
    { label: 'Processo Judicial', value: 'processo_judicial' },
    { label: 'Autor Falecido', value: 'autor_falecido' },
    { label: 'Ano do Óbito', value: 'ano_do_obito' },
    { label: 'Tipo de Procuração', value: 'tipo_de_procuracao' },
    { label: 'Se Analfabeto, Nome Pessoa Assinou/Rogo', value: 'se_analfabeto_nome_pessoa_assinou_rogo' },
    { label: 'Se Analfabeto, Testemunha 1', value: 'se_analfabeto_testemunha_1' },
    { label: 'Se Analfabeto, Testemunha 2', value: 'se_analfabeto_testemunha_2' },
    { label: 'Tipo de Comprovante', value: 'tipo_de_comprovante' },
    { label: 'Nome de Terceiro?', value: 'nome_de_terceiro' },
    { label: 'Se Sim, Qual Nome Terceiro', value: 'se_sim_qual_nome_terceiro' },
    { label: 'Número da Linha/Medidor/Hidrômetro', value: 'numero_linha_medidor_hidrometro' },
    { label: 'Código Cliente/Usuário/Matrícula', value: 'codigo_cliente_usuario_matricula' },
    { label: 'Número do Contrato/Conta', value: 'numero_contrato_conta' },
    { label: 'Número da Fatura/Nota Fiscal', value: 'numero_fatura_nota_fiscal' },
    { label: 'Código Débito Automático', value: 'codigo_debito_automatico' },
    { label: 'Código de Barras', value: 'codigo_barras' },
    { label: 'Valor da Fatura', value: 'valor_fatura' },
    { label: 'Comprovante de Residência com Suspeita de Fraude', value: 'comprovante_residencia_com_suspeita_de_fraude' },
    { label: 'Advogado ou Parte Não Compareceram à Audiência', value: 'advogado_ou_parte_nao_compareceram_a_audiecia' },
    { label: 'Decisões com Aplicação de Multa por Litigância de Má-fé', value: 'ha_decisoes_com_aplicacao_de_multa_por_litigancia_de_ma_fe' },
    { label: 'Decisões com Expedição de Ofício', value: 'ha_decisoes_com_expedicao_de_oficio' },
    { label: 'A Parte Alegou Desconhecer Ação e/ou Advogado', value: 'a_parte_alega_desconhecer_acao_e_ou_advogado' },
    { label: 'Decisão que Faz Menção à Litigância Predatória', value: 'ha_decisao_que_faz_mencao_a_litigancia_predatoria' },
    { label: 'Observações', value: 'observacoes' },
    { label: 'Advogado da Parte', value: 'advogado_parte' },
    { label: 'Análise', value: 'analise' },
  ];

  const handleApplyFilters = () => {
    const filteredColumns = columnsOptions.filter(col =>
      selectedColumns.includes(col.value)
    ).map(col => ({
      title: col.label,
      dataIndex: col.value,
      key: col.value,
      render: text => text === 'NaN' ? 'Não disponível' : text, // Para "NaN"
    }));

    setFilteredColumns(filteredColumns); // Atualiza as colunas filtradas
    setIsModalVisible(false); // Fecha o modal
  };

  const filteredColumnsToShow = filteredColumns.length > 0 ? filteredColumns : columnsOptions.map(col => ({
    title: col.label,
    dataIndex: col.value,
    key: col.value,
    render: text => text === 'NaN' ? 'Não disponível' : text, // Tratamento para "NaN"
  }));

  const handleGenerateReport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredData, { header: filteredColumnsToShow.map(col => col.title) });
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    
    // Abre o modal de confirmação
    setIsConfirmModalVisible(true);
  };

  const handleConfirmDownload = () => {
    // Mapeia os dados novamente para incluir apenas as colunas filtradas
    const filteredDataForExcel = filteredData.map(item => {
      const filteredItem = {};
      selectedColumns.forEach(col => {
        filteredItem[col] = item[col];
      });
      return filteredItem;
    });
  
    // Cria a planilha novamente
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredDataForExcel, { header: selectedColumns });
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, 'relatorio.xlsx');
  
    // Mensagem de sucesso
    message.success('Relatório gerado com sucesso!');
    setIsConfirmModalVisible(false); // Fecha o modal de confirmação
  };

  if (loading) return <Spin size="large" />;

  return (
    <div>
      <h1>Dados do Banco de Dados</h1>

      {/* Campo de Filtro Rápido */}
      <Input
        placeholder="Filtrar dados..."
        value={filterText}
        onChange={handleFilterChange}
        style={{ marginBottom: '16px' }}
      />

      {/* Botões separados */}
      <FiltroAvancadoButton onClick={() => setIsModalVisible(true)} />
      <GerarRelatorioButton onClick={handleGenerateReport} />

      {/* Modal para selecionar colunas */}
      <Modal
        title="Filtros Avançados"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleApplyFilters}
        width={600}
      >
        <Checkbox
          indeterminate={selectedColumns.length > 0 && selectedColumns.length < columnsOptions.length}
          checked={selectAll}
          onChange={(e) => setSelectAll(e.target.checked)}
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
                onChange={(e) => {
                  const updatedColumns = e.target.checked
                    ? [...selectedColumns, e.target.value]
                    : selectedColumns.filter(col => col !== e.target.value);
                  setSelectedColumns(updatedColumns);
                }}
              >
                {option.label}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Modal>

      {/* Tabela de Dados com rolagem horizontal */}
      <Table
        dataSource={paginatedData}
        columns={filteredColumnsToShow}
        pagination={false}
        scroll={{ x: 'max-content' }} // Adiciona rolagem horizontal
      />

      {/* Paginação */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={filteredData.length}
        onChange={handlePaginationChange}
        style={{ marginTop: '16px' }}
      />

      {/* Modal de confirmação */}
      <Modal
        title="Confirmar Geração do Relatório"
        visible={isConfirmModalVisible}
        onCancel={() => setIsConfirmModalVisible(false)}
        onOk={handleConfirmDownload}
      >
        <p>Tem certeza de que deseja gerar o relatório com os dados selecionados?</p>
      </Modal>
    </div>
  );
};

export default DataDisplay;
