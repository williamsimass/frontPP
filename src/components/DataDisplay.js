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
    { label: 'Nº de Integração', value: 'envolvido' },
    { label: 'Nº DO PROCESSO', value: 'processo_judicial' },
    { label: 'AUTOR FALECIDO', value: 'autor_falecido' },
    { label: 'ANO DO ÓBITO', value: 'ano_do_obito' },
    { label: 'TIPO DE PROCURAÇÃO?', value: 'tipo_de_procuracao' },
    { label: 'SE ANALFABETO: NOME DA PESSOA QUE ASSINOU A ROGO', value: 'se_analfabeto_nome_pessoa_assinou_rogo' },
    { label: 'SE ANALFABETO: TESTEMUNHA 1 (PROCURAÇÃO E/OU DECLARAÇÃO)', value: 'se_analfabeto_testemunha_1' },
    { label: 'SE ANALFABETO: TESTEMUNHA 2 (PROCURAÇÃO E/OU DECLARAÇÃO)', value: 'se_analfabeto_testemunha_2' },
    { label: 'TIPO DE COMPROVANTE', value: 'tipo_de_comprovante' },
    { label: 'NOME DE TERCEIRO?', value: 'nome_de_terceiro' },
    { label: 'SE SIM, QUAL O NOME DO TERCEIRO?', value: 'se_sim_qual_nome_terceiro' },
    { label: 'NÚMERO DA LINHA/MEDIDOR/HIDRÔMETRO', value: 'numero_linha_medidor_hidrometro' },
    { label: 'CÓDIGO DO CLIENTE/USUÁRIO/MATRÍCULA', value: 'codigo_cliente_usuario_matricula' },
    { label: 'NÚMERO DO CONTRATO/CONTA', value: 'numero_contrato_conta' },
    { label: 'NÚMERO DA FATURA/NOTA FISCAL', value: 'numero_fatura_nota_fiscal' },
    { label: 'CÓDIGO DÉBITO AUTOMÁTICO', value: 'codigo_debito_automatico' },
    { label: 'CÓDIGO DE BARRAS', value: 'codigo_barras' },
    { label: 'VALOR DA FATURA', value: 'valor_fatura' },
    { label: 'COMPROVANTE DE RESIDÊNCIA COM SUSPEITA DE FRAUDE?', value: 'comprovante_residencia_com_suspeita_de_fraude' },
    { label: 'O ADVOGADO OU A PARTE NÃO COMPARECERAM À AUDIÊNCIA?', value: 'advogado_ou_parte_nao_compareceram_a_audiecia' },
    { label: 'HÁ DECISÕES COM APLICAÇÃO DE MULTA POR LITIGÂNCIA DE MÁ-FÉ A PARTE OU CAUSÍDICO?', value: 'ha_decisoes_com_aplicacao_de_multa_por_litigancia_de_ma_fe' },
    { label: 'HÁ DECISÕES COM EXPEDIÇÃO DE OFÍCIO?', value: 'ha_decisoes_com_expedicao_de_oficio' },
    { label: 'A PARTE ALEGA DESCONHECER A AÇÃO E/OU O ADVOGADO?', value: 'a_parte_alega_desconhecer_acao_e_ou_advogado' },
    { label: 'HÁ DECISÃO QUE FAZ MENÇÃO A LITIGÂNCIA PREDATÓRIA?', value: 'ha_decisao_que_faz_mencao_a_litigancia_predatoria' },
    { label: 'OBSERVAÇÕES', value: 'observacoes' },
    { label: 'ADVOGADO_PARTE', value: 'advogado_parte' },
    { label: 'ANÁLISE', value: 'analise' },
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
