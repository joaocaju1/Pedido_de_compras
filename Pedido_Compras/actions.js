$(document).ready(function (e) {

	var dataLogTemp = new Date();

	var diaLog = dataLogTemp.getDate();
	if (parseInt(diaLog) < 10) {
		diaLog = "0" + diaLog;
	}
	var mesLog = dataLogTemp.getMonth();

	anoLog = dataLogTemp.getFullYear();

	var mes2Log = parseInt(mesLog) + 1;
	if (parseInt(mes2Log) < 10) {
		mes2Log = "0" + mes2Log;
	}
	
	itensEscolhido = new Array();
	cnpjsEscolhidos = new Array();
	cnpjOBJ = new Array();
	unicosCNPJ = new Array();

	dataCompletaLog = diaLog + '/' + mes2Log + '/' + anoLog;
	
	$("#produtoTemp").select2();
	//$("#razaoSocial").select2();
	$("#empresa").select2();

	$("#totalFrete").maskMoney();
	$("#totalDespesa").maskMoney();
	$("#totalDesconto").maskMoney();
	$("#valUnitTemp").maskMoney();	
	
	//$("#qtdDisponibilizadaCT").inputmask('Regex', {regex: "^[0-9]{1,6}(\\.\\d{1,2})?$"});
	
	
	
	//=================================================================
	//						VARIÁVEIS HOMOLOGAÇÃO
	//=================================================================
	URL_FLUIG = "https://fluighomolog.abainfra.com.br:2350";
	URL_TOTVS = "https://abainfraestrutura147637.protheus.cloudtotvs.com.br:3016/rest";
	ID_PASTA_PAI = '2318';
	ID_PASTA_UPLOAD = '';
	COND_PAG = new Array();
	TIPO_PEDIDO = new Array
	UNID_MEDIDA = new Array();
	
	COND_PAG = getCondPag();
	TIPO_PEDIDO = getTipoPedido();
	
		
	
	//getProduto();
	FLUIGC.switcher.init('#checkPossuiItemCT');

    $( "#tipoSC" ).change(function() {
        var selectValor = $( "#tipoSC" ).val();
		//console.log("selectValor: "+selectValor);
		
		var strProduto = '<i class="flaticon flaticon-product icon-md" aria-hidden="true"></i>&nbsp;&nbsp;Produtos';
		var strServico = '<i class="flaticon flaticon-system-tools icon-md" aria-hidden="true"></i>&nbsp;&nbsp;Serviço';
		
		$("#title_pn-produto").html("");
		
		if(selectValor == "PRODUTO"){
			$("#pn-produto").show();
			$("#divBtnGeraSolCompras").show();
			$("#pn-servico").hide();
			$("#divTipoMaterial").show();
			
			$(".servicoDiv").hide();
			$("#possuiContrato").val("");
			$("#aditivo").val("");
			
			$("#title_pn-produto").append(strProduto);
			
		}else if(selectValor == "SERVICO"){
			$(".servicoDiv").show();
			//$("#divBtnGeraSolCompras").hide();
			$("#pn-produto").show();
			$("#divTipoMaterial").hide();
			$("#pn-servico").hide();
			$("#tipoMaterial").val("");
			
			$("#title_pn-produto").append(strServico);
			
		}else{
			$(".servicoDiv").hide();
			$("#pn-produto").show();
			$("#pn-servico").hide();
			$("#divTipoMaterial").hide();
			//$("#divBtnGeraSolCompras").hide();
			
			//$("#title_pn-produto").append(strProduto);
		}
    });
	
	
	$("#empresa").change(function () { 
	
		$("#empresaTXT").val($('#empresa option:selected').text());
		console.log("VALOR EMPRESA: "+$('#empresa').val());
		console.log("TEXTO EMPRESA: "+ $('#empresa option:selected').text());
		
		if($('#empresa').val() != "null" && $('#empresa').val() != null){
			var empresa = new Array();
			empresa.push({
				"selecionado":$('#empresa').val(),
				"text": $('#empresa option:selected').text()
			});
			var obj = JSON.stringify(empresa);
			console.log("objEmpresa stringify: "+obj);
			$("#empresaOBJ").val(obj);
			
			getFiliais($('#empresa').val());

		}else{
			$("#empresaOBJ").val("");
		}
		
	});
	
	$("#filial").change(function () {    
		$("#filialTXT").val($('#filial option:selected').text());
		
		var filial = new Array();
		filial.push({
			'selecionado':$('#filial').val(),
			'text': $('#filial option:selected').text()
		});
		var obj = JSON.stringify(filial);
		$("#filialOBJ").val(obj);
		
	});
	
	$("#empresaSC").change(function () { 
	
		$("#empresaSCTXT").val($('#empresaSC option:selected').text());
		console.log("VALOR EMPRESA: "+$('#empresaSC').val());
		console.log("TEXTO EMPRESA: "+ $('#empresaSC option:selected').text());
		
		if($('#empresaSC').val() != "null" && $('#empresaSC').val() != null){
			var empresa = new Array();
			empresa.push({
				"selecionado":$('#empresaSC').val(),
				"text": $('#empresaSC option:selected').text()
			});
			var obj = JSON.stringify(empresa);
			console.log("objEmpresaSC stringify: "+obj);
			$("#empresaSCOBJ").val(obj);
			
			getFiliais($('#empresaSC').val());

		}else{
			$("#empresaSCOBJ").val("");
		}
		
	});
	
	$('#qtd, #dt_Necessidade, #dsc_pdt').prop('readonly', true);

	//Função para deixar os campos readonly até o select sem ativado (PRODUTO)
    $('#pdt_escolhas').on('change', function () {
        var selectedOption = $(this).val();

        if (selectedOption !== '') {
            $('#qtd, #dt_Necessidade, #dsc_pdt').prop('readonly', false);
        } else {
            $('#qtd, #dt_Necessidade, #dsc_pdt').prop('readonly', true);
        }
    });
	
	var calendario_dt_Necessidade = FLUIGC.calendar('#dataNecessidade');
	var calendar_dataPrevItemCT = FLUIGC.calendar('#dataPrevItemCT');

	controller();


}); // FIM DOCUMENT READY

//Função para minimizar e maximizar painel
function minimizarPainel(botao) {
    const painel = botao.closest('.panel');
    const conteudo = painel.querySelector('.panel-body');

    if (conteudo.style.display === 'none') {
        // Maximizar o painel
        conteudo.style.display = 'block';
        botao.textContent = '-';
    } else {
        // Minimizar o painel
        conteudo.style.display = 'none';
        botao.textContent = '+';
    }
}


//função para validar CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) {
        return false;
    }

    // Verifica se todos os dígitos são iguais; ex: 00000000000000
    if (/^(\d)\1+$/.test(cnpj)) {
        return false;
    }

    // Calcula o primeiro dígito verificador
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado != digitos.charAt(0)) {
        return false;
    }

    // Calcula o segundo dígito verificador
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);

    if (resultado != digitos.charAt(1)) {
        return false;
    }

    return true;
}

//Função para minimizar e maximizar painel
function minimizarPainel(botao) {
    const painel = botao.closest('.panel');
    const conteudo = painel.querySelector('.panel-body');

    if (conteudo.style.display === 'none') {
        // Maximizar o painel
        conteudo.style.display = 'block';
        botao.textContent = '-';
    } else {
        // Minimizar o painel
        conteudo.style.display = 'none';
        botao.textContent = '+';
    }
}


function mostrarDiv(tipo) {
		var divProduto = document.getElementById("divProduto");
		var divServico = document.getElementById("divServico");

		if (tipo === "produto") {
			divProduto.style.display = "block";
			divServico.style.display = "none";
		} else if (tipo === "servico") {
			divProduto.style.display = "none";
			divServico.style.display = "block";
		}
	}

function convertDtTxt(idCampo) {
	const data = $("#"+idCampo).val();
	$("#"+idCampo+"TXT").val($("#"+idCampo).val());
	if(data != "") {
		$("#dataNecessidadeFormatada").val(data.split("/").reverse().join(""));
	}
}

function alteraTXT(campo) {
	console.log("alteraTXT campo id: "+"#" + campo + "TXT"+" - "+campo);
	
	$("#" + campo + "TXT").val($("#" + campo).val());
	
	console.log("após alteraTXT campo: "+$("#" + campo + "TXT").val());

}

function alteraTXTtbpf(campo) {
	console.log("campo: "+campo);
	var idCampo = campo.split("___");
	console.log("id campo: "+"#" + idCampo[0] + "TXT___"+idCampo[1]+" - VALOR: "+$("#" + campo).val());
	
	$("#" + idCampo[0] + "TXT___"+idCampo[1]).val($("#" + campo).val());

}

//##################################################################################
//	FUNÇÃO QUE CAPTURA OS Nº FINAL DO ID DA TABELA E RETORNA EM UM ARRAY
//##################################################################################		
function varreTabela(idTabela) {

	var id = new Array();
	var campo = "";
	var pos = 0;

	$("#" + idTabela + " tbody tr .exclude").each(function () { //captura os id de inputs somente da tabela selecionada		
		campo = $(this).attr("id"); //pega o id inteiro do campo
		pos = campo.lastIndexOf("___");
		if (pos > 0) {
			var res = campo.split("___");
			id.push(res[1]);
		}

	});
	//alert("array id: "+id);
	return id;
}

function setCampoTXT(id) {

	var str = id.split("___");
	$("#" + id + "TXT").val($("#" + id).val());

}

function addElemento(tabela) {
	//console.log("entrou addElemento");
	var qtd = 0;
	var linha = wdkAddChild(tabela);
	var inputs = new Array();
	var campo = "";
	var ultimoCampo = "";
	var str = "";
	var inicioCampo = "";

	$("#" + tabela + " tbody tr .exclude").each(function () { //captura os id de inputs somente da tabela selecionada	
		campo = $(this).attr("id"); //pega o id inteiro do campo
		inicioCampo = campo.split('___');
		str = inicioCampo[0] + '___';
		if (str.toUpperCase() == ("exclude" + tabela + "___").toUpperCase()) { // verifica se o resultado Ã© igual Ã  condiÃ§Ã£o.
			inputs.push(campo); // caso seja armazena o id inteiro no array inputs
		}
	});

	ultimoCampo = inputs.pop();
	qtd = campo.substr(str.length);
	if (ultimoCampo != "") {
		$("#divexclude" + tabela + "___" + qtd).append("<i class='fluigicon fluigicon-trash icon-md' onclick='Javascript:fnWdkRemoveChild(this)' id='btnExclude" + tabela + "___" + qtd + "'></i>");
	}


}

function limpaSelect2(idCampo){
	$("#"+idCampo).val(null).trigger('change');
	
}

function limpaDate(idCampo){
	$("#"+idCampo).val("");
}

function verificaPrimeiroProd(){
	
	var tbGradeProdutos = varreTabela("tbGradeProdutos");
	
	$("#primeiroProdutoCod").val("");
	$("#primeiroProdutoTXT").val("");
	
	if(tbGradeProdutos.length > 0){
		var codProduto = $("#codProdutoSC___"+tbGradeProdutos[0]).val();
		var descricao = $("#descrProdutoSC___"+tbGradeProdutos[0]).val();

		$("#primeiroProdutoCod").val(codProduto);
		$("#primeiroProdutoTXT").val(descricao);
		
	}
	
	
	
	
}

function limpaTbProdutoSCTemp(){
	//console.log("entrou limpaTbProdutoSCTemp");
	$("#produtoTemp").val("");
	$("#quantidadeTemp").val("");
	$("#centroCustoTemp").val("");
	$("#naturezaTemp").val("");
	
	$("#tipoProdutoTemp").val("");
	$("#uniMedProdutoTemp").val("");
	$("#contaContabProdTemp").val("");
	$("#itemContaProdTemp").val("");
	$("#aliqIPITemp").val("");
	$("#valIPITemp").val("");
	$("#totalItemTemp").val("");
	$("#totalBrutoItemTemp").val("");
	//$("#categoriaSC").val("");
	//$("#categoriaSCTXT").val("");
	$("#obsPedidoTemp").val("");
	$("#valUnitTemp").val("");
	
	$("#infoComplProdutoTemp").val("");
	$("#obsPedidoTemp").val("");
		
	$("#produtoTemp option").remove();
	$("#naturezaTemp option").remove();
	//$("#naturezaTemp").val(null).trigger('change');
	$("#centroCustoTemp option").remove();
	
	$("#uniMedProdutoTemp option").remove();
	$("#uniMedProdutoTempTXT").val("");
	$("#uniMedProdutoTempOBJ").val("");
	
	$("#uniMedProdutoTemp").select2({
		placeholder: 'Selecione',
		data: UNID_MEDIDA		
	});
	
	$("#uniMedProdutoTemp").val(null).trigger('change');
}

function btnTbProdutosTempSC(acao){
	//console.log("entrou btnTbProdutosTempSC");
	var tbGradeProdutos = varreTabela("tbItensPedido");
	var numAtividade = $("#numAtividade").val();

	for (var i = 0; i < tbGradeProdutos.length; i++) {
		var elemento = $("#acoesItensPedido___" + tbGradeProdutos[i]).prev();
		var dados = "<div class='btn-group'>" +
						"<i class='flaticon flaticon-edit-square icon-md' onclick='editaProdutoSC(this.id)' id='btnEdita___" + tbGradeProdutos[i]+"' style='color:#4273d1'></i>&nbsp;&nbsp;&nbsp;&nbsp;"+
						"<i class='fluigicon fluigicon-trash icon-md' onclick='Javascript:fnWdkRemoveChild(this),calculaTotalPedido()' style='color:#cf007a' id='btnExclude" + tbGradeProdutos[i] + " '></i>"+
					"</div>";
		
		var somenteLeitura = "<div class='btn-group'>" +
						"<button type='button' class='btn btn-info' onclick='visualizaProdutoSC(this.id)' id='btnDetalhesSC___" + tbGradeProdutos[i]+"' >Detalhes</button>"+
					"</div>";
		
		$(elemento).html("");
		//console.log("acao: "+acao);
		if(numAtividade == "" || numAtividade == "0" || numAtividade == "4" && acao != "SOMENTE_LEITURA") {
			//console.log("entrou primeiro if");
			$(elemento).html("");
			$(elemento).append(dados);
		}if( (numAtividade == "" || numAtividade == "0" || numAtividade == "4") && acao == "SOMENTE_LEITURA") {
			//console.log("entrou segundo if");
			blockDadosSol();
			$(elemento).html("");
			$(elemento).append(somenteLeitura);
		}else if(numAtividade != "" && numAtividade != "0" && numAtividade != "4" ){
			//console.log("entrou terceiro if");
			$(elemento).html("");
			$(elemento).append(somenteLeitura);
		}
		
	}
}

function recarregaProdutoTemp(){
	
	$("#produtoTemp").select2();
	
	getProduto();
	
	$("#limpar_produtoTemp").show();
	$("#trocar_produtoTemp").hide();
	
}

function recarregaCentroCustoTemp(){
	
	$("#centroCustoTemp").select2();
	
	getCentroCusto();
	
	$("#limpar_centroCustoTemp").show();
	$("#trocar_centroCustoTemp").hide();
	
}

function editaProdutoSC(idCampo){
	console.log("entrou editaProdutoSC");
	var temp = idCampo.split("___");
	var numLinha = temp[1];
	
	$("#produtoTemp").select2("destroy");
	$("#centroCustoTemp").select2("destroy");
	
	$("#produtoTemp option").remove();
	$("#produtoTemp").append($('<option>', {
		value: $("#codItemSolicitado___"+numLinha).val(),
		text: $("#descItemSolicitado___"+numLinha).val()
	}));
		
	$("#centroCustoTemp option").remove();
	$("#centroCustoTemp").append($('<option>', {
		value: $("#codCentroCusto___"+numLinha).val(),
		text: $("#centroCusto___"+numLinha).val()
	}));
	
	$("#naturezaTemp option").remove();
	$("#naturezaTemp").append($('<option>', {
		value: $("#codNaturezaProd___"+numLinha).val(),
		text: $("#naturezaProd___"+numLinha).val()
	}));
	
	var unidMedSTR = $("#uniMedProdutoOBJ___"+numLinha).val();
	var unidMedOBJ = JSON.parse(unidMedSTR);
	
	$("#uniMedProdutoTemp option").remove();
	$("#uniMedProdutoTemp").append($('<option>', {
		value: unidMedOBJ[0].selecionado,
		text: unidMedOBJ[0].text
	}));
	
	$("#quantidadeTemp").val( $("#qtdItem___"+numLinha).val() );
	$("#uniMedProdutoTempOBJ").val( $("#uniMedProdutoOBJ___"+numLinha).val() );
	$("#valUnitTemp").val( $("#valUnitario___"+numLinha).val() );
	$("#categoriaSC").val( $("#codCategoriaItemSC___"+numLinha).val() );
	$("#obsPedidoTemp").val( $("#obsItem___"+numLinha).val() );
	$("#infoComplProdutoTemp").val( $("#infoComplItem___"+numLinha).val() );
	$("#aliqIPITemp").val( $("#aliqIPI___"+numLinha).val() );
	$("#valIPITemp").val( $("#valIPI___"+numLinha).val() );
	$("#totalItemTemp").val( $("#totalItem___"+numLinha).val() );
	$("#numLinhaProdutoSC").val( numLinha );
	
	$("#adicionaProdutoSC").hide();
	$("#salvaProdutoSC").show();
	
	$("#limpar_produtoTemp").hide();
	$("#trocar_produtoTemp").show();
	
	$("#limpar_centroCustoTemp").hide();
	$("#trocar_centroCustoTemp").show();
	
	calculaTotalItem();
}

function saveTbGradeProdutos(){
	console.log("entrou saveTbGradeProdutos");
	var contErro = validaTbGradeProdutos();
	var linha = $("#numLinhaProdutoSC").val();
	
	console.log("cont erro validaTbGradeProdutos: "+contErro);
	if(contErro == 0){
		$("#adicionaProdutoSC").show();
		$("#salvaProdutoSC").hide();
		
		$("#limpar_produtoTemp").show();
		$("#trocar_produtoTemp").hide();
		
		$("#limpar_centroCustoTemp").show();
		$("#trocar_centroCustoTemp").hide();
		
		$("#codItemSolicitado___"+linha).val($("#produtoTemp").val());
		$("#descItemSolicitado___"+linha).val($("#produtoTemp  option:selected").text());
		$("#qtdItem___"+linha).val($("#quantidadeTemp").val());
		
		$("#tipoProd___"+linha).val($("#tipoProdutoTemp").val());
		$("#uniMedProduto___"+linha).val($("#uniMedProdutoTemp").val());
		$("#uniMedProdutoOBJ___"+linha).val($("#uniMedProdutoTempOBJ").val());
		$("#contaContabProd___"+linha).val($("#contaContabProdTemp").val());
		$("#itemContaProd___"+linha).val($("#itemContaProdTemp").val());
		
		$("#naturezaProd___"+linha).val($("#naturezaTemp  option:selected").text());
		$("#codNaturezaProd___"+linha).val($("#naturezaTemp").val());
		
		$("#aliqIPI___"+linha).val($("#aliqIPITemp").val());
		$("#valIPI___"+linha).val($("#valIPITemp").val());
		$("#totalItem___"+linha).val($("#totalItemTemp").val());
		$("#totalBrutoItem___"+linha).val($("#totalBrutoItemTemp").val());
		
		$("#codCentroCusto___"+linha).val($("#centroCustoTemp").val());
		$("#centroCusto___"+linha).val($("#centroCustoTemp  option:selected").text());
		//$("#codCategoriaItemSC___"+linha).val($("#categoriaSC").val());
		//$("#descCategoriaItemSC___"+linha).val($("#categoriaSC  option:selected").text());
		//$("#descrCentroCustoSC___"+linha).val($("#centroCustoTemp  option:selected").text());
		$("#obsItem___"+linha).val($("#obsPedidoTemp").val());
		$("#infoComplItem___"+linha).val($("#infoComplProdutoTemp").val());
		
		limpaTbProdutoSCTemp();
		btnTbProdutosTempSC();	
		
		$("#produtoTemp").select2();	
		$("#centroCustoTemp").select2();	
		
		getProduto();
		getCentroCusto();
		
		$("#lb_produtoTemp").css('color', '');
		$("#lb_centroCustoTemp").css('color', '');
		
		$("#numLinhaProdutoSC").val("");
		
		verificaPrimeiroProd();
		
		calculaTotalPedido();
		
	}
	
}
	

function visualizaProdutoSC(idCampo){
	//console.log("entrou visualizaProdutoSC");
	var temp = idCampo.split("___");
	var numLinha = temp[1];
	var numAtividade = $("#numAtividade").val();
	
	$(".divTempProdutos").show();
	if( (numAtividade == "" || numAtividade == "0" || numAtividade == "4") &&  $("#numSC").val() == ""){
		$("#produtoTemp").select2("destroy");
		$("#centroCustoTemp").select2("destroy");	
	}
	
	
	$("#produtoTemp option").remove();
	$("#produtoTemp").append($('<option>', {
		value: $("#codItemSolicitado___"+numLinha).val(),
		text: $("#descItemSolicitado___"+numLinha).val()
	}));
		
	$("#centroCustoTemp option").remove();
	$("#centroCustoTemp").append($('<option>', {
		value: $("#codCentroCusto___"+numLinha).val(),
		text: $("#centroCusto___"+numLinha).val()
	}));
	
	$("#naturezaTemp option").remove();
	$("#naturezaTemp").append($('<option>', {
		value: $("#codNaturezaProd___"+numLinha).val(),
		text: $("#naturezaProd___"+numLinha).val()
	}));
	
	$("#quantidadeTemp").val( $("#qtdItem___"+numLinha).val() );
	$("#valUnitTemp").val( $("#valUnitario___"+numLinha).val() );
	$("#aliqIPITemp").val( $("#aliqIPI___"+numLinha).val() );
	$("#valIPITemp").val( $("#valIPI___"+numLinha).val() );
	$("#totalItemTemp").val( $("#totalItem___"+numLinha).val() );
	$("#categoriaSC").val( $("#codCategoriaItemSC___"+numLinha).val() );
	$("#obsPedidoTemp").val( $("#obsItem___"+numLinha).val() );
	$("#infoComplProdutoTemp").val( $("#infoComplItem___"+numLinha).val() );
	$("#numLinhaProdutoSC").val( numLinha );
	
	$("#adicionaProdutoSC").hide();
	$("#salvaProdutoSC").hide();
	
	$("#limpar_produtoTemp").hide();
	$("#trocar_produtoTemp").hide();
	
	$("#limpar_centroCustoTemp").hide();
	$("#trocar_centroCustoTemp").hide();
	
	$("#produtoTemp").attr("disabled", "disabled");
	$("#naturezaTemp").attr("disabled", "disabled");
	$("#filtroNatureza").attr("disabled", "disabled");
	$("#centroCustoTemp").attr("disabled", "disabled");
	$("#quantidadeTemp").attr("readonly", "readonly");
	$("#valUnitTemp").attr("readonly", "readonly");
	$("#aliqIPITemp").attr("readonly", "readonly");
	$("#categoriaSC").attr("disabled", "disabled");
	$("#obsPedidoTemp").attr("readonly", "readonly");
	$("#infoComplProdutoTemp").attr("readonly", "readonly");
	$("#ocultaProdutoSC").show();
	
}

function ocultaTbGradeProdutos(){
	//console.log("entrou ocultaTbGradeProdutos");
	limpaTbProdutoSCTemp();
	$(".divTempProdutos").hide();
	$("#ocultaProdutoSC").hide();
}

function retornaUser(){
		//console.log("entrou retornaUser");
		var codUser = $("#codUsuario").val();
		//console.log("codUser: "+codUser);
		
		var constraintColleague1 = DatasetFactory.createConstraint('colleaguePK.colleagueId', codUser, codUser, ConstraintType.MUST);
		var colunasColleague = new Array('colleagueName');
		var dataset = DatasetFactory.getDataset('colleague', colunasColleague, new Array(constraintColleague1), null);

		var row = dataset.values[0];
		
		//console.log("colleagueName: "+row["colleagueName"]);
		
		$("#solicitante").val(row["colleagueName"]);
		$("#codSolicitante").val(codUser);

		
	}
	
function retornaLogado(codUsuario){
	
	var constraintColleague1 = DatasetFactory.createConstraint('colleaguePK.colleagueId', codUsuario, codUsuario, ConstraintType.MUST);
	var colunasColleague = new Array('colleagueName');
	var dataset = DatasetFactory.getDataset('colleague', colunasColleague, new Array(constraintColleague1), null);

	var row = dataset.values[0];

	
	var nomeUsuario = row["colleagueName"];

	return nomeUsuario;
}


function resumoCotacao(idCampo){
	//console.log("entrou resumoCotacao");
	
	//console.log("entrou editaItemCotacao");
	var temp = idCampo.split("___");
	var numLinha = temp[1];
	
	var cnpj = $("#cnpj___"+numLinha).val();
	
	$("#divResumoCotacao").show();
	
	somaTotalCotacao(numLinha, cnpj);
}

function resumoCotacaoFinal(idCampo){
	//console.log("entrou resumoCotacao");
	
	//console.log("entrou editaItemCotacao");
	var temp = idCampo.split("___");
	var numLinha = temp[1];
	
	var cnpj = $("#cnpj___"+numLinha).val();
	
	$("#divResumoCotacao").show();
	
	somaTotalCotacaoFinal(numLinha, cnpj);
}

function ocultaResumo(){
	
	$("#divResumoCotacao").hide();
	
	$("#cnpjResumoTotal").val("");
	$("#totalItensCT").val("");
	$("#totalDescontosCT").val("");
	$("#totalImpostosCT").val("");
	$("#totalFreteCT").val("");
	$("#totalCotacaoCT").val("");
	$("#formaPagamentoCT").val("");
	$("#qtdDiasPrevEntregaCT").val("");
	$("#dataPrevItemCT").val("");
	$("#linhaCotacaoOriginalCT").val("");
	
}


function trocaValue(id){
	console.log("entrou trocaValue: "+id);
	$("#"+id+"TXT").val( $("#"+id).val() );
	
	var OBJ = new Array();
	
	OBJ.push({
		"id":$("#"+id).val(),
		"text": $("#"+id+" option:selected").text()
	});
	
	var OBJtxt = JSON.stringify(OBJ);
	
	$("#"+id+"OBJ").val( OBJtxt );
	console.log("OBJtxt: "+OBJtxt);
	console.log("valor campo: "+ $("#"+id+"OBJ").val( ));
	
}


function btnTbItensCotacao(){
	//console.log("entrou btnTbItensCotacao");
	
	var tbItensCotacao = varreTabela("tbItensCotacao");
	var numAtividade = $("#numAtividade").val();
	

	for (var i = 0; i < tbItensCotacao.length; i++) {
		var elemento = $("#acoesItensCotacao___" + tbItensCotacao[i]).prev();
		
		
		var dados = "<div class='btn-group'>" +
						"<button type='button' class='btn btn-info' onclick='editaItemCotacao(this.id)' id='btnEdita___" + tbItensCotacao[i]+"'>Editar</button>"+
					"</div>";
		
		var somenteLeitura = "<div class='btn-group'>" +
								"<button type='button' class='btn btn-info' onclick='visualizaItemCotacao(this.id)' id='btnDetalhesItem___" + tbItensCotacao[i]+"' >Visualizar</button>"+
							"</div>";
		
		$(elemento).html("");
		if(numAtividade == "0" || numAtividade == "4" || numAtividade == "") {
			$(elemento).append(dados);
		}if(numAtividade == "10") {
			$(elemento).append(dados);
		}else{
			$(elemento).append(somenteLeitura);
		}
		var optPossuiItem = $("#optPossuiItem___"+tbItensCotacao[i]).val();
	
		if(optPossuiItem == "true"){
			$("#btnEdita___"+tbItensCotacao[i]).removeAttr("disabled");
		}else{
			$("#btnEdita___"+tbItensCotacao[i]).attr("disabled","disabled");
		}
	}
	
	//console.log("final btnTbItensCotacao");
	
}

function salvaItemCotacao(){
	console.log("entrou salvaItemCotacao");
	
	
	//var contErro = validatbCotacao();
	var numLinha = $("#numLinhaItemCT").val();
	
	console.log("SALVANDO ITEM COTACAO LINHA: "+numLinha);
	
	$("#descItemSolicitado___"+numLinha).val( $("#descItemCT").val());
	$("#codItemSolicitado___"+numLinha).val($("#codItemCT").val() );
	$("#itemDisponibilizado___"+numLinha).val($("#itemDisponibilizadoCT").val() );
	$("#qtdSolicitada___"+numLinha).val($("#qtdSolicitadaCT").val() );
	$("#qtdDisponibilizada___"+numLinha).val($("#qtdDisponibilizadaCT").val() );
	
	
	$("#infoComplItemSC___"+numLinha).val( $("#infoComplItemSCCT").val() );
	$("#infoComplItemFornec___"+numLinha).val( $("#infoComplItemFornecCT").val() );
	$("#outroImpostoDesc___"+numLinha).val( $("#outroImpostoDescCT").val() );
	
	
	if($("#valUnitarioCT").val() != ""){
		var valUnitarioCT = $("#valUnitarioCT").maskMoney('unmasked')[0];
		var valUnitario = parseFloat(valUnitarioCT); 
		$("#valUnitario___"+numLinha).val(valUnitario.toFixed(2));
	}else{
		$("#valUnitario___"+numLinha).val("0.00");
	}
	
	if($("#freteItemCT").val() != ""){
		var freteItemCT = $("#freteItemCT").maskMoney('unmasked')[0];
		var freteItem = parseFloat(freteItemCT); 
		$("#freteItem___"+numLinha).val(freteItem.toFixed(2));
	}else{
		$("#freteItem___"+numLinha).val("0.00");
	}
	
	if($("#descontoItemCT").val() != ""){
		var descontoItemCT = $("#descontoItemCT").maskMoney('unmasked')[0];
		var descontoItem = parseFloat(descontoItemCT); 
		$("#descontoItem___"+numLinha).val(descontoItem.toFixed(2));
	}else{
		$("#descontoItem___"+numLinha).val("0.00");
	}
	
	if($("#icmsItemCT").val() != ""){
		var icmsItemCT = $("#icmsItemCT").maskMoney('unmasked')[0];
		var icmsItem = parseFloat(icmsItemCT); 
		$("#icmsItem___"+numLinha).val(icmsItem.toFixed(2));
	}else{
		$("#icmsItem___"+numLinha).val("0.00");
	}

	if($("#ipiItemCT").val() != ""){
		var ipiItemCT = $("#ipiItemCT").maskMoney('unmasked')[0];
		var ipiItem = parseFloat(ipiItemCT); 
		$("#ipiItem___"+numLinha).val(ipiItem.toFixed(2));
	}else{
		$("#ipiItem___"+numLinha).val("0.00");
	}
	
	if($("#pisItemCT").val() != ""){
		var pisItemCT = $("#pisItemCT").maskMoney('unmasked')[0];
		var pisItem = parseFloat(pisItemCT); 
		$("#pisItem___"+numLinha).val(pisItem.toFixed(2));
	}else{
		$("#pisItem___"+numLinha).val("0.00");
	}

	if($("#cofinsItemCT").val() != ""){
		var cofinsItemCT = $("#cofinsItemCT").maskMoney('unmasked')[0];
		var cofinsItem = parseFloat(cofinsItemCT); 
		$("#cofinsItem___"+numLinha).val(cofinsItem.toFixed(2));
	}else{
		$("#cofinsItem___"+numLinha).val("0.00");
	}
	
	if($("#issItemCT").val() != ""){
		var issItemCT = $("#issItemCT").maskMoney('unmasked')[0];
		var issItem = parseFloat(issItemCT); 
		$("#issItem___"+numLinha).val(issItem.toFixed(2));
	}else{
		$("#issItem___"+numLinha).val("0.00");
	}
	
	if($("#inssItemCT").val() != ""){
		var inssItemCT = $("#inssItemCT").maskMoney('unmasked')[0];
		var inssItem = parseFloat(inssItemCT); 
		$("#inssItem___"+numLinha).val(inssItem.toFixed(2));
	}else{
		$("#inssItem___"+numLinha).val("0.00");
	}
	
	if($("#irItemCT").val() != ""){
		var irItemCT = $("#irItemCT").maskMoney('unmasked')[0];
		var irItem = parseFloat(irItemCT); 
		$("#irItem___"+numLinha).val(irItem.toFixed(2));
	}else{
		$("#irItem___"+numLinha).val("0.00");
	}
	
	if($("#csllItemCT").val() != ""){
		var csllItemCT = $("#csllItemCT").maskMoney('unmasked')[0];
		var csllItem = parseFloat(csllItemCT); 
		$("#csllItem___"+numLinha).val(csllItem.toFixed(2));
	}else{
		$("#csllItem___"+numLinha).val("0.00");
	}
	
	if($("#outroImpostoVlrItemCT").val() != ""){
		var outroImpostoVlrItemCT = $("#outroImpostoVlrItemCT").maskMoney('unmasked')[0];
		var outroImpostoVlrItem = parseFloat(outroImpostoVlrItemCT); 
		$("#outroImpostoVlrItem___"+numLinha).val(outroImpostoVlrItem.toFixed(2));
	}else{
		$("#outroImpostoVlrItem___"+numLinha).val("0.00");
	}
	
	if($("#totalItemCT").val() != ""){
		var totalItemCT = $("#totalItemCT").maskMoney('unmasked')[0];
		var totalItem = parseFloat(totalItemCT); 
		$("#totalItem___"+numLinha).val(totalItem.toFixed(2));
	}else{
		$("#totalItem___"+numLinha).val("0.00");
	}
	
	$("#divDetalhesItemCotacao").hide();
	//console.log("fim salvaItemCotacao e antes de chamar funcao de somaTotalCotacao");
	
	var linhaCotacaoOriginal = $("#linhaCotacaoOriginal___"+numLinha).val();
	var cnpjFornecCotacao = $("#cnpjFornecCotacao___"+numLinha).val();
	
	console.log("ANTES CHAMADA somaTotalCotacao");
	console.log("linhaCotacaoOriginal: "+linhaCotacaoOriginal);
	console.log("cnpjFornecCotacao: "+cnpjFornecCotacao);
	
	
	somaTotalCotacao(linhaCotacaoOriginal,cnpjFornecCotacao );
	
	//$("#divDetalhesItemCotacao").hide();
	
}

//##################################################################################
//				FUNÇÃO QUE FORMATA VALOR PARA DECIMAL
//##################################################################################
function formataDecimal(src){
	//console.log("entrou formataDecimal: "+src.value);
	
	var val = src.value
	
	while(val.indexOf('.') != -1)  {
		val = val.replace('.','');  
	}
	return val;
	
}

function formataInt(idCampo){
	//console.log("entrou formataInt");	
	if($("#"+idCampo).val() != ""){
		var campo = $("#"+idCampo).val();
		if(campo.indexOf('.') != -1){
			while(campo.indexOf('.') != -1)  {
				campo = campo.replace('.','');  
			}
		}
		
		var retorno = parseInt(campo);
		const options = { minimumFractionDigits: 0, maximumFractionDigits: 3 }
		const formatNumber = new Intl.NumberFormat('pt-BR', options)
		 
		let number = retorno;
		retorno = formatNumber.format(number);

		$("#"+idCampo).val(retorno);
	}
	
}

function calculaTotalItem(){
	console.log("entrou calculaTotalItem");	
	
	
	if($("#quantidadeTemp").val() != ""){
		var qtdDisponibilizadaCT = $("#quantidadeTemp").val();
		if(qtdDisponibilizadaCT.indexOf('.') != -1){
			while(qtdDisponibilizadaCT.indexOf('.') != -1)  {
				qtdDisponibilizadaCT = qtdDisponibilizadaCT.replace('.','');  
			}
		}
		var qtdDisponibilizada = parseFloat(qtdDisponibilizadaCT);
		//console.log("qtdDisponibilizada Float: "+qtdDisponibilizada);
	}else{
		var qtdDisponibilizada = 0.00;
	}
	
	if($("#valUnitTemp").val() != ""){
		var valUnitarioCT = $("#valUnitTemp").maskMoney('unmasked')[0];
		var valUnitario = parseFloat(valUnitarioCT); 
		////console.log("valUnitarioCT: "+valUnitarioCT);
	}else{
		var valUnitarioCT = 0.00;
	}
	
	
	console.log("entrou calculaIPIItem");
	if($("#quantidadeTemp").val() != ""){
		var qtdDisponibilizadaCT = $("#quantidadeTemp").val();
		if(qtdDisponibilizadaCT.indexOf('.') != -1){
			while(qtdDisponibilizadaCT.indexOf('.') != -1)  {
				qtdDisponibilizadaCT = qtdDisponibilizadaCT.replace('.','');  
			}
		}
		var qtdDisponibilizada = parseFloat(qtdDisponibilizadaCT);
		//console.log("qtdDisponibilizada Float: "+qtdDisponibilizada);
	}else{
		var qtdDisponibilizada = 0.00;
	}
	
	if($("#valUnitTemp").val() != ""){
		var valUnitarioCT = $("#valUnitTemp").maskMoney('unmasked')[0];
		var valUnitario = parseFloat(valUnitarioCT); 
		////console.log("valUnitarioCT: "+valUnitarioCT);
	}else{
		var valUnitarioCT = 0.00;
	}
	
	var aliqIPI = $("#aliqIPITemp").val();
	
	console.log("qtdDisponibilizada: "+qtdDisponibilizada+" - valUnitarioCT: "+valUnitarioCT);
	if(qtdDisponibilizada > 0 && valUnitarioCT > 0 && aliqIPI != ""){
		var subtotal = parseFloat(qtdDisponibilizada) * parseFloat(valUnitarioCT);
	
		var aliqIPI = $("#aliqIPITemp").val();
		
		if (aliqIPI.indexOf(',') > -1){
			console.log("achou , em totalLinha");
			var aliqIPIFloat = parseFloat(aliqIPI.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);
		}else{
			var aliqIPIFloat = parseFloat(aliqIPI);
			aliqIPIFloat = aliqIPIFloat.toFixed(2);
			
		}

		
		console.log("aliqIPIFloat apos parseFloat: "+aliqIPIFloat);
		
		console.log("aliqIPIFloat: "+aliqIPIFloat);
		var valIPI = (subtotal * aliqIPIFloat)/100;
		valIPI = valIPI.toFixed(2);
		console.log("valIPI calculado: "+valIPI);
		
		var valIPIFormatado = valIPI.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		
		$("#valIPITemp").val(valIPIFormatado);
	}else{
		var valIPIFormatado = 0.00;
		$("#valIPITemp").val('R$ 0,00');
	}
	
	
	if($("#valIPITemp").val() != ""){
		var valIPITempCT = $("#valIPITemp").maskMoney('unmasked')[0];
		var valIPIFloat = parseFloat(valIPITempCT); 
		////console.log("valUnitarioCT: "+valUnitarioCT);
	}else{
		var valIPI = 0.00;
		valIPIFloat = parseFloat(valIPI);
		valIPIFloat = valIPIFloat.toFixed(2);
	}
	
	console.log("valIPIFloat: "+valIPIFloat);
	
	console.log("CALCULANDO TOTAL ITEM:");
	if(qtdDisponibilizadaCT != "" && valUnitarioCT != ""){
		console.log("qtdDisponibilizadaCT: "+qtdDisponibilizadaCT+" - valUnitarioCT: "+valUnitarioCT);
		
		var subTotal = (qtdDisponibilizada * valUnitario);
		console.log("subTotal calculado: "+subTotal);
		subTotal = subTotal.toFixed(2);
		console.log("subTotal toFixed: "+subTotal);
		
		$("#totalBrutoItemTemp").val(subTotal);
	
		var total = parseFloat(subTotal) + parseFloat(valIPIFormatado);
		total = total.toFixed(2);
		
		var atual = parseFloat(total);
		//$("#totalItemCT").val(total.toFixed(2));
		//$("#totalItemCT").maskMoney();
		var totalFormatado = atual.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		////console.log("TOTAL FORMATADO: "+totalFormatado);
		$("#totalItemTemp").val(totalFormatado);
	}else{
		////console.log("entrou else calculo");
		$("#totalItemTemp").maskMoney('mask', 0.00);
		
	}


}

function calculaIPIItem(){
	console.log("entrou calculaIPIItem");
	if($("#quantidadeTemp").val() != ""){
		var qtdDisponibilizadaCT = $("#quantidadeTemp").val();
		if(qtdDisponibilizadaCT.indexOf('.') != -1){
			while(qtdDisponibilizadaCT.indexOf('.') != -1)  {
				qtdDisponibilizadaCT = qtdDisponibilizadaCT.replace('.','');  
			}
		}
		var qtdDisponibilizada = parseFloat(qtdDisponibilizadaCT);
		//console.log("qtdDisponibilizada Float: "+qtdDisponibilizada);
	}else{
		var qtdDisponibilizada = 0.00;
	}
	
	if($("#valUnitTemp").val() != ""){
		var valUnitarioCT = $("#valUnitTemp").maskMoney('unmasked')[0];
		var valUnitario = parseFloat(valUnitarioCT); 
		////console.log("valUnitarioCT: "+valUnitarioCT);
	}else{
		var valUnitarioCT = 0.00;
	}
	
	var aliqIPI = $("#aliqIPITemp").val();
	
	console.log("qtdDisponibilizada: "+qtdDisponibilizada+" - valUnitarioCT: "+valUnitarioCT);
	if(qtdDisponibilizada > 0 && valUnitarioCT > 0 && aliqIPI != ""){
		var subtotal = parseFloat(qtdDisponibilizada) * parseFloat(valUnitarioCT);
	
		var aliqIPI = $("#aliqIPITemp").val();
		
		if (aliqIPI.indexOf(',') > -1){
			console.log("achou , em totalLinha");
			var aliqIPIFloat = parseFloat(aliqIPI.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);
		}else{
			var aliqIPIFloat = parseFloat(aliqIPI);
			aliqIPIFloat = aliqIPIFloat.toFixed(2);
			
		}

		
		console.log("aliqIPIFloat apos parseFloat: "+aliqIPIFloat);
		
		console.log("aliqIPIFloat: "+aliqIPIFloat);
		var valIPI = (subtotal * aliqIPIFloat)/100;
		valIPI = valIPI.toFixed(2);
		console.log("valIPI calculado: "+valIPI);
		
		var valIPIFormatado = valIPI.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		
		$("#valIPITemp").val(valIPIFormatado);
	}else{
		$("#valIPITemp").val('R$ 0,00');
	}

}

function addTbGradeProdutos(){
	//console.log("entrou addTbGradeProdutos");
	var contErro = validaTbGradeProdutos();
	
	if(contErro > 0){
		$("#msgErrotbGradeProdutos").show();
		
		setTimeout(function() {
			$("#msgErrotbGradeProdutos").hide();
		}, 5000);

	}else{
		var linha = wdkAddChild("tbItensPedido");
	
		$("#codItemSolicitado___"+linha).val($("#produtoTemp").val());
		$("#descItemSolicitado___"+linha).val($("#produtoTemp  option:selected").text());
		$("#qtdItem___"+linha).val($("#quantidadeTemp").val());
		$("#codCentroCusto___"+linha).val($("#centroCustoTemp").val());
		$("#centroCusto___"+linha).val($("#centroCustoTemp option:selected").text());
		$("#codNaturezaProd___"+linha).val($("#naturezaTemp").val());
		$("#naturezaProd___"+linha).val($("#naturezaTemp option:selected").text());
		$("#infoComplItem___"+linha).val($("#infoComplProdutoTemp").val());
		$("#obsItem___"+linha).val($("#obsPedidoTemp").val());
		
		$("#tipoProd___"+linha).val($("#tipoProdutoTemp").val());
		$("#uniMedProduto___"+linha).val($("#uniMedProdutoTemp").val());
		$("#contaContabProd___"+linha).val($("#contaContabProdTemp").val());
		$("#itemContaProd___"+linha).val($("#itemContaProdTemp").val());
		$("#valUnitario___"+linha).val($("#valUnitTemp").val());
		$("#totalItem___"+linha).val($("#totalItemTemp").val());
		$("#totalBrutoItem___"+linha).val($("#totalBrutoItemTemp").val());
		
		$("#totalBrutoItem___"+linha).val($("#totalItemTemp").val());
		
		$("#aliqIPI___"+linha).val($("#aliqIPITemp").val());
		$("#valIPI___"+linha).val($("#valIPITemp").val());
		
		limpaTbProdutoSCTemp();
		btnTbProdutosTempSC();
		calculaTotalPedido();
		$("#msgErrotbGradeProdutos").hide();
		
		//verificaPrimeiroProd();
	}
}

function calculaTotalPedido(){
	console.log("entrou calculaTotalPedido");
	
		
	var tbItensPedido = varreTabela("tbItensPedido");
	
	var subtotal = 0.00;
	var totalDesconto = 0.00;
	var totalFrete = 0.00;
	var totalImpostos = 0.00;
	var totalICMS = 0.00;
	var totalIPI = 0.00;
	var totalPIS = 0.00;
	var totalCOFINS = 0.00;
	
	var totalISS = 0.00;
	var totalINSS = 0.00;
	var totalIR = 0.00;
	var totalCSLL = 0.00;
	var totalOUTRO = 0.00;

	var totalItem = 0.00;
	
	var itemFormatado = 0.00;
	var unitarioFormatado = 0.00;
	var descontoFormatado = 0.00;
	var freteFormatado = 0.00;
	
	var icmsFormatado = 0.00;
	var ipiFormatado = 0.00;
	var pisFormatado = 0.00;
	var cofinsFormatado = 0.00;
	
	var issFormatado = 0.00;
	var inssFormatado = 0.00;
	var irFormatado = 0.00;
	var csllFormatado = 0.00;
	var outroImpostoVlrFormatado = 0.00;
	
	var impostosFormatado = 0.00;
	
	var objData = new Array();
	var objDataOrdenado = new Array();
	
	//===============================================================
	//							CALCULA FRETE POR ITEM
	//===============================================================
	var totalFrete = $("#totalFrete").val();
	
	if (totalFrete != ""){
		if (totalFrete.indexOf('R$') > -1){
			var totalFreteTXT = $("#totalFrete").maskMoney('unmasked')[0];
			var totalFreteFloat = parseFloat(totalFreteTXT);
		}else{
			var totalFreteFloat = parseFloat(totalFrete);
		}
	}
	
	
	var totalBruto = 0.00;
	
	
	//===============================================================
	//							CALCULA ITENS
	//===============================================================
	console.log(">> ENTROU CALCULA ITENS <<");

	for(var i=0;i<tbItensPedido.length;i++){
		console.log("Calculando linha: "+tbItensPedido[i]);

			
			var totalLinha = $("#totalItem___"+tbItensPedido[i]).val();

			if(totalLinha != ""){
				var totalLinhaCT = $("#totalItem___"+tbItensPedido[i]).maskMoney('unmasked')[0];
				console.log("totalItem___"+tbItensPedido[i]+" unmasked: "+totalLinhaCT);
				totalLinhaFloat = parseFloat(totalLinhaCT);
				
				console.log("totalItem___"+tbItensPedido[i]+" após parseFloat: "+totalLinhaFloat);
				console.log("subtotal: "+subtotal+" = subtotal: "+parseFloat(subtotal)+" + "+parseFloat(totalLinhaFloat) );
				
				subtotal = parseFloat(subtotal) + parseFloat(totalLinhaFloat);
				subtotal = subtotal.toFixed(2);
				
				var subtotalMoeda = totalLinhaFloat.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
				console.log("subtotalMoeda: "+subtotalMoeda);
				//$("#totalItemCTF___"+tbItensPedido[i]).val(subtotalMoeda);
				
			}else if(totalLinha != "" && possuiItem == "false"){
				var subtotalMoeda = 0.00;
				subtotalMoeda = subtotalMoeda.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
				console.log("subtotalMoeda: "+subtotalMoeda);	
			}
			
			//CALCULANDO TOTAL BRUTO
			
			var totalBrutoItem = $("#totalBrutoItem___"+tbItensPedido[i]).val();

			if(totalBrutoItem != ""){
				var totalBrutoItemCT = $("#totalBrutoItem___"+tbItensPedido[i]).maskMoney('unmasked')[0];
				console.log("totalBrutoItem___"+tbItensPedido[i]+" unmasked: "+totalBrutoItemCT);
				totalBrutoItemFloat = parseFloat(totalBrutoItemCT);
				
				console.log("totalBrutoItem___"+tbItensPedido[i]+" após parseFloat: "+totalBrutoItemFloat);
				console.log("totalBruto: "+totalBruto+" = totalBruto: "+parseFloat(totalBruto)+" + "+parseFloat(totalBrutoItemFloat) );
				
				totalBruto = parseFloat(totalBruto) + parseFloat(totalBrutoItemFloat);
				//totalBruto = totalBruto.toFixed(2);
				
				//var totalBrutoMoeda = totalLinhaFloat.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
				//console.log("subtotalMoeda: "+subtotalMoeda);
				//$("#totalItemCTF___"+tbItensPedido[i]).val(subtotalMoeda);
				
			}else if(totalLinha != "" && possuiItem == "false"){
				var subtotalMoeda = 0.00;
				subtotalMoeda = subtotalMoeda.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
				console.log("subtotalMoeda: "+subtotalMoeda);	
			}
			
			
			

	}
	
	
	var totalBrutoMoeda = totalBruto.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	console.log("totalBrutoMoeda: "+totalBrutoMoeda);
	$("#totalItensCTF").val(totalBrutoMoeda);
	
	var totalBrutoItens = 0.00;
	totalBrutoItens = totalBruto.toFixed(2);
	
	$("#totalBrutoItensCTF").val(totalBrutoItens);

	//===============================================================
	//							CALCULA TOTAL
	//===============================================================
	
	
	//=======================================================================================================
	
	//=======================================================================================================
	var totalDescontosCT = $("#totalDesconto").val();
	if(totalDescontosCT != ""){
		var totalDescontosCT = $("#totalDesconto").maskMoney('unmasked')[0];
		var totalDescontos = parseFloat(totalDescontosCT);
		//var totalDescontosFormatado = totalDescontos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		if(!isNaN(totalDescontos)){
			console.log("entrou primeiro if desconto");
			var totalDescontosFormatado = totalDescontos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		}else{
			console.log("entrou segundo if  desconto");
			var totalDescontosFormatado = totalDescontosCT;
		}
	}else{
		var totalDescontos = 0.00;
		var totalDescontosFormatado = totalDescontos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	
		//=======================================================================================================
	var totalDespesasCT = $("#totalDespesa").val();
	if(totalDespesasCT != ""){
		var totalDespesasCT = $("#totalDespesa").maskMoney('unmasked')[0];
		var totalDespesas = parseFloat(totalDespesasCT);
		//var totalDescontosFormatado = totalDescontos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		if(!isNaN(totalDespesas)){
			console.log("entrou primeiro if totalDespesa");
			var totalDespesasFormatado = totalDespesas.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		}else{
			console.log("entrou segundo if  totalDespesa");
			var totalDespesasFormatado = totalDespesasCT;
		}
	}else{
		var totalDespesas = 0.00;
		var totalDespesasFormatado = totalDespesas.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	
	//=======================================================================================================
	var totalFreteCT = $("#totalFrete").val();
	console.log("total frete antes parseFloat: "+totalFreteCT);
	if(totalFreteCT != ""){
		var totalFreteCT = $("#totalFrete").maskMoney('unmasked')[0];
		var totalFrete = parseFloat(totalFreteCT);
		console.log("total frete após parseFloat: "+totalFrete);

		if(!isNaN(totalFrete)){
			console.log("entrou primeiro if total frete");
			var totalFreteFormatado = totalFrete.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		}else{
			console.log("entrou segundo if total frete");
			var totalFreteFormatado = totalFreteCT;
		}
		
	}else{
		var totalFrete = 0.00;
		var totalFreteFormatado = totalFrete.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	//$("#totalFreteCT").val( totalFreteFormatado );
	
	//=======================================================================================================
	console.log("totalPedido = "+subtotal+" + "+parseFloat(totalFrete)+" + "+parseFloat(totalDescontos)+" + "+parseFloat(totalDespesas));
	var totalPedido = (parseFloat(subtotal)+parseFloat(totalFrete)+parseFloat(totalDespesas)) - parseFloat(totalDescontos);
	
	
	console.log("totalPedido: "+totalPedido);
	if(totalPedido != ""){
		var totalCotacaoFloat = parseFloat(totalPedido);
		//console.log("totalCotacaoCT formatado: "+totalCotacaoCT);
		if(!isNaN(totalCotacaoFloat)){
			console.log("entrou primeiro if (totalCotacao)");
			var totalCotacaoFormatado = totalPedido.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
			$("#totalPedido").val(totalCotacaoFormatado);
		}else{
			console.log("entrou segundo if isNaN(totalCotacao)");
			var totalCotacaoFormatado = totalPedido;
			$("#totalPedido").val(totalCotacaoFormatado);
		}
		
	}else{
		var totalPedido = 0.00;
		var totalCotacaoFormatado = totalPedido.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		$("#totalPedido").val(totalCotacaoFormatado);
	}
	//console.log("totalCotacaoCT formatado money: "+totalCotacaoFormatado);
	//$("#totalCotacaoCT").val( totalCotacaoFormatado );
	
}

function ativaClassificacao(valor){
	console.log("entrou ativaClassificacao");
	console.log("valor: "+valor);
	
	for(var i=1; i<11; i++){
		if(parseInt(valor) == i){
			$("#class_"+i).attr('class', 'active');	
		}else{
			$("#class_"+i).attr('class', '');
		}
		 
		
	}
	
}


/*function somaTotalCotacaoFinal(numLinha, cnpj){
	console.log("entrou somaTotalCotacao");

	
	if(numLinha == undefined || numLinha == "undefined" || numLinha == ""){
		var numLinha = $("#numLinhaItemCTF").val();
		var cnpj = $("#cnpjFornecCotacaoCTF___"+numLinha).val();
	}
	
	var tbItensCotacao = varreTabela("tbItensCotacaoFinal");
	var tbCotacao = varreTabela("tbCotacaoFinal");
	
	var subtotal = 0.00;
	var totalDesconto = 0.00;
	var totalFrete = 0.00;
	var totalImpostos = 0.00;
	var totalICMS = 0.00;
	var totalIPI = 0.00;
	var totalPIS = 0.00;
	var totalCOFINS = 0.00;
	var totalItem = 0.00;
	
	var totalISS = 0.00;
	var totalINSS = 0.00;
	var totalIR = 0.00;
	var totalCSLL = 0.00;
	var totalOUTRO = 0.00;
	
	var itemFormatado = 0.00;
	var unitarioFormatado = 0.00;
	var descontoFormatado = 0.00;
	var freteFormatado = 0.00;
	
	var icmsFormatado = 0.00;
	var ipiFormatado = 0.00;
	var pisFormatado = 0.00;
	var cofinsFormatado = 0.00;
	
	var issFormatado = 0.00;
	var inssFormatado = 0.00;
	var irFormatado = 0.00;
	var csllFormatado = 0.00;
	var outroImpostoVlrFormatado = 0.00;
	
	var impostosFormatado = 0.00;
	
	var objData = new Array();
	var objDataOrdenado = new Array();
	
	//=============================================================================
	//								CALCULA ITENS COTACAO FINAL
	// ============================================================================
	for(var i=0;i<tbItensCotacao.length;i++){
		if($("#cnpjFornecCotacaoCTF___"+tbItensCotacao[i]).val() == cnpj && $("#optPossuiItemCTF___"+tbItensCotacao[i]).val() == "true" 
		 && $("#linhaCotacaoOriginalCTF___"+tbItensCotacao[i]).val() == numLinha ){
			var possuiItem = $("#optPossuiItemCTF___"+tbItensCotacao[i]).val();
			//CALCULA ITENS
			var itemLinha = $("#valUnitarioCTF___"+tbItensCotacao[i]).val();
			if(itemLinha != "" && possuiItem == "true"){
				unitarioFormatado = parseFloat(itemLinha);
				
				totalItem = parseFloat(totalItem) + parseFloat(unitarioFormatado);
				totalItem = totalItem.toFixed(2);
			}else if(itemLinha != "" && possuiItem == "false"){
				totalItem = 0.00;
			}
			
			//CALCULA TOTAL ITENS
			var totalLinha = $("#totalItemCTF___"+tbItensCotacao[i]).val();
			if(totalLinha != "" && possuiItem == "true"){
				itemFormatado = parseFloat(totalLinha);
				subtotal = parseFloat(subtotal) + parseFloat(itemFormatado);
				subtotal = subtotal.toFixed(2);
			}else if(totalLinha != "" && possuiItem == "false"){
				subtotal = 0.00;
			}
			
			//CALCULA TOTAL DESCONTOS
			var descontoLinha = $("#descontoItemCTF___"+tbItensCotacao[i]).val();
			if(descontoLinha != "" && possuiItem == "true"){
				descontoFormatado = parseFloat(descontoLinha);
				totalDesconto = parseFloat(totalDesconto) + parseFloat(descontoFormatado);
				totalDesconto = totalDesconto.toFixed(2);
			}else if(descontoLinha != "" && possuiItem == "true"){
				totalDesconto = 0.00;
			}
			
			//CALCULA TOTAL FRETE
			var itemFrete = $("#freteItemCTF___"+tbItensCotacao[i]).val();
			if(itemFrete != "" && possuiItem == "true"){
				freteFormatado = parseFloat(itemFrete);
				totalFrete = parseFloat(totalFrete) + parseFloat(freteFormatado);
				totalFrete = totalFrete.toFixed(2);
			}else if(itemFrete != "" && possuiItem == "true"){
				totalFrete = 0.00;
			}
			
			//CAPTURA ICMS
			var icmsItem = $("#icmsItemCTF___"+tbItensCotacao[i]).val();
			if(icmsItem != "" && possuiItem == "true"){
				icmsFormatado = parseFloat(icmsItem);
				totalICMS = parseFloat(totalICMS) + parseFloat(icmsFormatado);
				totalICMS = totalICMS.toFixed(2);
			}else if(icmsItem != "" && possuiItem == "true"){
				totalICMS = 0.00;
			}
			
			//CAPTURA IPI
			var ipiItem = $("#ipiItemCTF___"+tbItensCotacao[i]).val();
			if(ipiItem != "" && possuiItem == "true"){
				ipiFormatado = parseFloat(ipiItem);
				totalIPI = parseFloat(totalIPI) + parseFloat(ipiFormatado);
				totalIPI = totalIPI.toFixed(2);
			}else if(ipiItem != "" && possuiItem == "true"){
				totalIPI = 0.00;
			}
			
			//CAPTURA PIS
			var pisItem = $("#pisItemCTF___"+tbItensCotacao[i]).val();
			if(pisItem != "" && possuiItem == "true"){
				pisFormatado = parseFloat(pisItem);
				totalPIS = parseFloat(totalPIS) + parseFloat(pisFormatado);
				totalPIS = totalPIS.toFixed(2);
			}else if(pisItem != "" && possuiItem == "true"){
				totalPIS = 0.00;
			}
			
			//CAPTURA COFINS
			var cofinsItem = $("#cofinsItemCTF___"+tbItensCotacao[i]).val();
			if(cofinsItem != "" && possuiItem == "true"){
				cofinsFormatado = parseFloat(cofinsItem);
				totalCOFINS = parseFloat(totalCOFINS) + parseFloat(cofinsFormatado);
				totalCOFINS = totalCOFINS.toFixed(2);
			}else if(cofinsItem != "" && possuiItem == "true"){
				totalCOFINS = 0.00;
			}
			
			//CAPTURA ISS
			var issItem = $("#issItemCTF___"+tbItensCotacao[i]).val();
			if(issItem != "" && possuiItem == "true"){
				issFormatado = parseFloat(issItem);
				totalISS = parseFloat(totalISS) + parseFloat(issFormatado);
				totalISS = totalISS.toFixed(2);
			}else if(issItem != "" && possuiItem == "true"){
				totalISS = 0.00;
			}
			
			//CAPTURA INSS
			var inssItem = $("#inssItemCTF___"+tbItensCotacao[i]).val();
			if(inssItem != "" && possuiItem == "true"){
				inssFormatado = parseFloat(inssItem);
				totalINSS = parseFloat(totalINSS) + parseFloat(inssFormatado);
				totalINSS = totalINSS.toFixed(2);
			}else if(inssItem != "" && possuiItem == "true"){
				totalINSS = 0.00;
			}
			
			//CAPTURA IR
			var irItem = $("#irItemCTF___"+tbItensCotacao[i]).val();
			if(irItem != "" && possuiItem == "true"){
				irFormatado = parseFloat(irItem);
				totalIR = parseFloat(totalIR) + parseFloat(irFormatado);
				totalIR = totalIR.toFixed(2);
			}else if(irItem != "" && possuiItem == "true"){
				totalIR = 0.00;
			}
			
			//CAPTURA CSLL
			var csllItem = $("#csllItemCTF___"+tbItensCotacao[i]).val();
			if(csllItem != "" && possuiItem == "true"){
				csllFormatado = parseFloat(csllItem);
				totalCSLL = parseFloat(totalCSLL) + parseFloat(csllFormatado);
				totalCSLL = totalCSLL.toFixed(2);
			}else if(csllItem != "" && possuiItem == "true"){
				totalCSLL = 0.00;
			}
			
			//CAPTURA outroImpostoVlr
			var outroImpostoVlr = $("#csllItemCTF___"+tbItensCotacao[i]).val();
			if(outroImpostoVlr != "" && possuiItem == "true"){
				outroImpostoVlrFormatado = parseFloat(outroImpostoVlr);
				totalOUTRO = parseFloat(totalOUTRO) + parseFloat(outroImpostoVlrFormatado);
				totalOUTRO = totalOUTRO.toFixed(2);
			}else if(outroImpostoVlr != "" && possuiItem == "true"){
				totalOUTRO = 0.00;
			}
			
		}		
	}

	//=============================================================================
	//						CALCULA TOTAL COTACAO FINAL
	// ============================================================================
	
	totalImpostos = parseFloat(totalICMS) + parseFloat(totalIPI) + parseFloat(totalPIS) + parseFloat(totalCOFINS) + parseFloat(totalISS) + parseFloat(totalINSS) + parseFloat(totalIR) + parseFloat(totalCSLL) + parseFloat(totalOUTRO) ;

	totalImpostos = totalImpostos.toFixed(2);

	
	$("#cnpjResumoTotalCTF_resumo").val(cnpj);
	
	//=======================================================================================================
	var totalItensCT = $("#totalItensCTF___"+numLinha).val();
	console.log("totalItensCT antes do if: "+totalItensCT);
	if(totalItensCT != ""){
		console.log("somaTotalCotacaoFinal entrou if totalItensCT: "+totalItensCT);
		var totalItensCT = $("#totalItensCTF___"+numLinha).maskMoney('unmasked')[0];
		console.log("totalItensCT unmasked: "+totalItensCT);
		var totalItens = parseFloat(totalItensCT);
		if(!isNaN(totalItens)){
			//console.log("entrou primeiro if");
			var totalItensFormatado = totalItens.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		}else{
			//console.log("entrou segundo if");
			var totalItensFormatado = totalItensCT;
		}
	}else{
		var totalItens = 0.00;
		var totalItensFormatado = totalItens.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#totalItensCTF_resumo").val( totalItensFormatado );
	
	
	//=======================================================================================================
	var totalDescontosCT = $("#totalDescontosCTF___"+numLinha).val();
	if(totalDescontosCT != ""){
		var totalDescontos = parseFloat(totalDescontosCT);
		//var totalDescontosFormatado = totalDescontos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		if(!isNaN(totalDescontos)){
			//console.log("entrou primeiro if");
			var totalDescontosFormatado = totalDescontos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		}else{
			//console.log("entrou segundo if");
			var totalDescontosFormatado = totalDescontosCT;
		}
	}else{
		var totalDescontos = 0.00;
		var totalDescontosFormatado = totalDescontos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#totalDescontosCTF_resumo").val( totalDescontosFormatado );
	
	//=======================================================================================================
	var totalImpostosCT = $("#totalImpostosCTF___"+numLinha).val();
	if(totalImpostosCT != ""){
		var totalImpostos = parseFloat(totalImpostosCT);
		//var totalImpostosFormatado = totalImpostos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		
		if(!isNaN(totalImpostos)){
			//console.log("entrou primeiro if");
			var totalImpostosFormatado = totalImpostos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		}else{
			//console.log("entrou segundo if");
			var totalImpostosFormatado = totalImpostosCT;
		}
		
		
	}else{
		var totalImpostos = 0.00;
		var totalImpostosFormatado = totalImpostos.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#totalImpostosCTF_resumo").val( totalImpostosFormatado );
	
	//=======================================================================================================
	var totalFreteCT = $("#totalFreteCTF___"+numLinha).val();
	if(totalFreteCT != ""){
		var totalFrete = parseFloat(totalFreteCT);
		//var totalFreteFormatado = totalFrete.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});

		if(!isNaN(totalFrete)){
			//console.log("entrou primeiro if");
			var totalFreteFormatado = totalFrete.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		}else{
			//console.log("entrou segundo if");
			var totalFreteFormatado = totalFreteCT;
		}
		
	}else{
		var totalFrete = 0.00;
		var totalFreteFormatado = totalFrete.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#totalFreteCTF_resumo").val( totalFreteFormatado );
	
	//=======================================================================================================
	var totalCotacaoCT = $("#totalCotacaoCTF___"+numLinha).val();
	//console.log("totalCotacaoCT: "+totalCotacaoCT);
	if(totalCotacaoCT != ""){
		var totalCotacao = parseFloat(totalCotacaoCT);
		//console.log("totalCotacaoCT formatado: "+totalCotacaoCT);
		if(!isNaN(totalCotacao)){
			//console.log("entrou primeiro if");
			var totalCotacaoFormatado = totalCotacao.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		}else{
			//console.log("entrou segundo if");
			var totalCotacaoFormatado = totalCotacaoCT;
		}
		
	}else{
		var totalCotacao = 0.00;
		var totalCotacaoFormatado = totalCotacao.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	//console.log("totalCotacaoCT formatado money: "+totalCotacaoFormatado);
	$("#totalCotacaoCTF_resumo").val( totalCotacaoFormatado );

	
}
*/

function formataTbItensCotacaoMoeda(){
	console.log("entrou formataTbItensCotacaoMoeda");
	var tbItensCotacao = varreTabela("tbItensCotacao");
	
	for(var i=0;i<tbItensCotacao.length;i++){
		
		var valUnitario = $("#valUnitario___"+tbItensCotacao[i]).val();
		if(valUnitario.indexOf("R$") > -1){
			valUnitario = $("#valUnitario___"+tbItensCotacao[i]).maskMoney('unmasked')[0];
		}
		if(valUnitario != "" ){
			valUnitario = parseFloat(valUnitario);
			var valUnitarioMoeda = valUnitario.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
			$("#valUnitario___"+tbItensCotacao[i]).val(valUnitarioMoeda);	
		}
		
		var totalItem = $("#totalItem___"+tbItensCotacao[i]).val();
		if(totalItem.indexOf("R$") > -1){
			totalItem = $("#totalItem___"+tbItensCotacao[i]).maskMoney('unmasked')[0];
		}
		if(totalItem != "" ){
			totalItem = parseFloat(totalItem);
			var totalItemMoeda = totalItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
			$("#totalItem___"+tbItensCotacao[i]).val(totalItemMoeda);
			console.log("após formatação totalItens: "+$("#totalItem___"+tbItensCotacao[i]).val());
		}
			
	
	}
	
}

function formataTbItensCotacaoFinalMoeda(){
	
	var tbItensCotacao = varreTabela("tbItensCotacaoFinal");
	
	for(var i=0;i<tbItensCotacao.length;i++){
		
		var valUnitario = $("#valUnitarioCTF___"+tbItensCotacao[i]).val();
		if(valUnitario.indexOf("R$") > -1){
			valUnitario = $("#valUnitarioCTF___"+tbItensCotacao[i]).maskMoney('unmasked')[0];
		}
		if(valUnitario != "" ){
			valUnitario = parseFloat(valUnitario);
			var valUnitarioMoeda = valUnitario.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
			$("#valUnitarioCTF___"+tbItensCotacao[i]).val(valUnitarioMoeda);	
		}
		
		var totalItem = $("#totalItemCTF___"+tbItensCotacao[i]).val();
		if(totalItem.indexOf("R$") > -1){
			totalItem = $("#totalItemCTF___"+tbItensCotacao[i]).maskMoney('unmasked')[0];
		}
		if(totalItem != "" ){
			totalItem = parseFloat(totalItem);
			var totalItemMoeda = totalItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
			$("#totalItemCTF___"+tbItensCotacao[i]).val(totalItemMoeda);	
		}
			
	
	}
	
}

function encerraCotacao(){
	
	var cnpjTotal = $("#cnpjResumoTotal").val();
	
	var tbCotacao = varreTabela("tbCotacao");
	var tbItensCotacao = varreTabela("tbItensCotacao");
	
	var itemPendente = 0;
	var qtdItensCotacao = 0;
	
	var dataLogTemp = new Date();

	var diaLog = dataLogTemp.getDate();
	if (parseInt(diaLog) < 10) {
		diaLog = "0" + diaLog;
	}
	var mesLog = dataLogTemp.getMonth();

	anoLog = dataLogTemp.getFullYear();

	var mes2Log = parseInt(mesLog) + 1;
	if (parseInt(mes2Log) < 10) {
		mes2Log = "0" + mes2Log;
	}

	var dataCompletaLog = diaLog + '/' + mes2Log + '/' + anoLog;
	var dataInvertida = anoLog+mes2Log+diaLog;
	
	for(var i=0;i<tbItensCotacao.length;i++){
		
		var totalItem = $("#totalItem___"+tbItensCotacao[i]).val();
		var optPossuiItem = $("#optPossuiItem___"+tbItensCotacao[i]).val();
		var cnpjFornecCotacao = $("#cnpjFornecCotacao___"+tbItensCotacao[i]).val();
		
		if( ( (totalItem == "" || totalItem == "0.00") && optPossuiItem == "true") && (cnpjFornecCotacao == cnpjTotal)){
			itemPendente++;
		}
	}
	
	for(var i=0;i<tbCotacao.length;i++){
		if($("#cnpj___"+tbCotacao[i]).val() == cnpjTotal){
			qtdItensCotacao++;
		}
	}
	
	for(var i=0;i<tbCotacao.length;i++){
		if($("#cnpj___"+tbCotacao[i]).val() == cnpjTotal){
			$("#dataRespCotacao___"+tbCotacao[i]).val( dataCompletaLog );
			$("#dataRespCotacaoFormat___"+tbCotacao[i]).val( dataInvertida );
			$("#anoRespCotacao___"+tbCotacao[i]).val( anoLog );
			$("#mesRespCotacao___"+tbCotacao[i]).val( mes2Log );
			$("#formaPagamento___"+tbCotacao[i]).val( $("#formaPagamentoCT").val() );
			$("#qtdDiasPrevEntrega___"+tbCotacao[i]).val( $("#qtdDiasPrevEntregaCT").val() );
			$("#previsaoEntrega___"+tbCotacao[i]).val( $("#dataPrevItemCT").val() );
			
			$("#qtdDiasPrevPagamento___"+tbCotacao[i]).val( $("#qtdDiasPrevPagamentoCT").val() );
			$("#previsaoPagamento___"+tbCotacao[i]).val( $("#dataPrevPagItemCT").val() );
			
			if(itemPendente == 0){
				$("#statusCotacao___"+tbCotacao[i]).val( "CONCLUIDO" );
				$("#divItensCotacao").hide();
			}else if(itemPendente > 0 && itemPendente == qtdItensCotacao){
				$("#statusCotacao___"+tbCotacao[i]).val( "CONCLUIDO" );
				$("#divItensCotacao").hide();
			}else if(itemPendente > 0 && itemPendente != qtdItensCotacao){
					FLUIGC.toast({
						title: 'Atenção! ',
						message: 'Cotação não foi encerrada devido haver itens pendentes. Favor verifique para poder concluir!',
						type: 'danger'
					});
					$("#statusCotacao___"+tbCotacao[i]).val( "PENDENTE" );
			}
		}
		i = tbCotacao.length +1;
	}
	
	ocultaResumo();
	
}

function setFormaPagamento(){
	//console.log("entrou setFormaPagamento");
	var cnpj = $("#cnpjResumoTotal").val();
	var tbCotacao = varreTabela("tbCotacao");
	
	for(var i=0;i<tbCotacao.length;i++){
		if($("#cnpj___"+tbCotacao[i]).val() == cnpj){
			$("#formaPagamento___"+tbCotacao[i]).val($("#formaPagamentoCT").val());		
			i = tbCotacao.length +1;
		}		
	}
}

function setQtdDiasEntrega(){
	//console.log("entrou setQtdDiasEntrega");
	var cnpj = $("#cnpjResumoTotal").val();
	var tbCotacao = varreTabela("tbCotacao");
	
	for(var i=0;i<tbCotacao.length;i++){
		if($("#cnpj___"+tbCotacao[i]).val() == cnpj){
			$("#qtdDiasPrevEntrega___"+tbCotacao[i]).val($("#qtdDiasPrevEntregaCT").val());		
			i = tbCotacao.length +1;
		}		
	}
}

function setDataPrevEntrega(){
	//console.log("entrou setDataPrevEntrega");
	var cnpj = $("#cnpjResumoTotal").val();
	var tbCotacao = varreTabela("tbCotacao");
	
	for(var i=0;i<tbCotacao.length;i++){
		if($("#cnpj___"+tbCotacao[i]).val() == cnpj){
			$("#previsaoEntrega___"+tbCotacao[i]).val($("#dataPrevItemCT").val());		
			i = tbCotacao.length +1;
		}		
	}
}


function imprimeTBCotacao(){
	
	var tbCotacao = varreTabela("tbCotacao");
	//console.log("Tamanho tbCotacao: "+tbCotacao.length);
	
	for(var i=0;i<tbCotacao.length;i++){
		//console.log("################################################################");
		//console.log("NUM LINHA  : *"+tbCotacao[i]+"*");
		//console.log("excludetbCotacao  : *"+$("#excludetbCotacao___"+tbCotacao[i]).val()+"*");
		//console.log("cnpj  : *"+$("#cnpj___"+tbCotacao[i]).val()+"*");
		//console.log("loja  : *"+$("#loja___"+tbCotacao[i]).val()+"*");
		//console.log("cep  : *"+$("#cep___"+tbCotacao[i]).val()+"*");
		//console.log("estado  : *"+$("#estado___"+tbCotacao[i]).val()+"*");
		//console.log("bairro  : *"+$("#bairro___"+tbCotacao[i]).val()+"*");
		//console.log("endereco  : *"+$("#endereco___"+tbCotacao[i]).val()+"*");
		//console.log("complemento  : *"+$("#complemento___"+tbCotacao[i]).val()+"*");
		//console.log("contato  : *"+$("#contato___"+tbCotacao[i]).val()+"*");
		//console.log("telefoneFornec  : *"+$("#telefoneFornec___"+tbCotacao[i]).val()+"*");
		//console.log("emailFornec  : *"+$("#emailFornec___"+tbCotacao[i]).val()+"*");
		//console.log("razaoSocial  : *"+$("#razaoSocial___"+tbCotacao[i]).val()+"*");
		//console.log("statusCotacao  : *"+$("#statusCotacao___"+tbCotacao[i]).val()+"*");
		//console.log("totalItens  : *"+$("#totalItens___"+tbCotacao[i]).val()+"*");
		//console.log("totalDescontos  : *"+$("#totalDescontos___"+tbCotacao[i]).val()+"*");
		//console.log("totalImpostos  : *"+$("#totalImpostos___"+tbCotacao[i]).val()+"*");
		//console.log("totalFrete  : *"+$("#totalFrete___"+tbCotacao[i]).val()+"*");
		//console.log("formaPagamento  : *"+$("#formaPagamento___"+tbCotacao[i]).val()+"*");
		//console.log("dataCotacao  : *"+$("#dataCotacao___"+tbCotacao[i]).val()+"*");
		//console.log("dataRespCotacao  : *"+$("#dataRespCotacao___"+tbCotacao[i]).val()+"*");
		//console.log("totalCotacao  : *"+$("#totalCotacao___"+tbCotacao[i]).val()+"*");
		//console.log("qtdDiasPrevEntrega  : *"+$("#qtdDiasPrevEntrega___"+tbCotacao[i]).val()+"*");
		//console.log("previsaoEntrega  : *"+$("#previsaoEntrega___"+tbCotacao[i]).val()+"*");
		//console.log("acoesFornecedores  : *"+$("#acoesFornecedores___"+tbCotacao[i]).val()+"*");
		//console.log("################################################################"+"*");
	}
	
	
}

function editaCotacao(idCampo){
	//console.log("entrou editaCotacao");
	var str = idCampo.split("___");
	var linhaCotacao = str[1];
	
	var cnpjCotacao = $("#cnpj___"+linhaCotacao).val();
	
	
	var tbItensCotacao = varreTabela("tbItensCotacao");
	
	for(var i=0;i<tbItensCotacao.length;i++){
		var linhaCotacaoOriginal = $("#linhaCotacaoOriginal___"+tbItensCotacao[i]).val();
		//console.log("#cnpjFornecCotacao___"+tbItensCotacao[i]+": "+$("#cnpjFornecCotacao___"+tbItensCotacao[i]).val()+" = cnpjCotacao: "+cnpjCotacao);
		//console.log("#linhaCotacaoOriginal: "+linhaCotacaoOriginal+" = linhaCotacao: "+linhaCotacao);
		if($("#cnpjFornecCotacao___"+tbItensCotacao[i]).val() == cnpjCotacao && linhaCotacaoOriginal == linhaCotacao){
			var elemento = $("#excludetbItensCotacao___"+tbItensCotacao[i]).parent().parent();
			elemento.show();
		}else{
			var elemento = $("#excludetbItensCotacao___"+tbItensCotacao[i]).parent().parent();
			elemento.hide();
		}
	}
	
	$("#divItensCotacao").show();
	carregaBtnPossuiItem();
	btnTbItensCotacao();
}

function editaCotacaoFinal(idCampo){
	//console.log("entrou editaCotacao");
	var str = idCampo.split("___");
	var linhaCotacao = str[1];
	
	var cnpjCotacao = $("#cnpjCTF___"+linhaCotacao).val();
	
	
	var tbItensCotacao = varreTabela("tbItensCotacaoFinal");
	
	for(var i=0;i<tbItensCotacao.length;i++){
		var linhaCotacaoOriginal = $("#linhaCotacaoOriginalCTF___"+tbItensCotacao[i]).val();
		//console.log("#cnpjFornecCotacao___"+tbItensCotacao[i]+": "+$("#cnpjFornecCotacao___"+tbItensCotacao[i]).val()+" = cnpjCotacao: "+cnpjCotacao);
		//console.log("#linhaCotacaoOriginal: "+linhaCotacaoOriginal+" = linhaCotacao: "+linhaCotacao);
		if($("#cnpjFornecCotacaoCTF___"+tbItensCotacao[i]).val() == cnpjCotacao && linhaCotacaoOriginal == linhaCotacao){
			var elemento = $("#excludetbItensCotacaoCTF___"+tbItensCotacao[i]).parent().parent();
			elemento.show();
		}else{
			var elemento = $("#excludetbItensCotacaoCTF___"+tbItensCotacao[i]).parent().parent();
			elemento.hide();
		}
	}
	
	$("#divItensCotacaoFinal").show();
	carregaBtnPossuiItemFinal();
	btnTbItensCotacaoFinal();
}

function ocultaItensCotacao(){
	
	var tbItensCotacao = varreTabela("tbItensCotacao");
	
	var elemento = $("#excludetbItensCotacao___"+tbItensCotacao[i]).parent().parent();
	elemento.hide();
		
}


function visualizaItemCotacao(idCampo){
	//console.log("entrou editaItemCotacao");
	var temp = idCampo.split("___");
	var numLinha = temp[1];
	
	$("#divDetalhesItemCotacao").show();
	
	$("#numLinhaItemCT").val( numLinha );
	
	$("#descItemCT").val( $("#descItemSolicitado___"+numLinha).val() );
	$("#codItemCT").val( $("#codItemSolicitado___"+numLinha).val() );
	$("#itemDisponibilizadoCT").val( $("#itemDisponibilizado___"+numLinha).val() );
	$("#qtdSolicitadaCT").val( $("#qtdSolicitada___"+numLinha).val() );
	$("#qtdDisponibilizadaCT").val( $("#qtdDisponibilizada___"+numLinha).val() );
	
	//console.log("infoComplItemSC___"+numLinha+": "+$("#infoComplItemSC___"+numLinha).val());
	$("#infoComplItemSCCT").val( $("#infoComplItemSC___"+numLinha).val() );
	$("#infoComplItemFornecCT").val( $("#infoComplItemFornec___"+numLinha).val() );
	
	$("#btnSaveItem").show();
	
	//===========================================================================================================
	var valUnitarioCT = $("#valUnitario___"+numLinha).val();
	if(valUnitarioCT != ""){
		var valUnitarioUnmasked = $("#valUnitario___"+numLinha).maskMoney('unmasked')[0];
		var valUnitarioCT = parseFloat(valUnitarioUnmasked);
		var valUnitario = parseFloat(valUnitarioCT);
		var valUnitarioFormatado = valUnitario.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var valUnitario = 0.00;
		var valUnitarioFormatado = valUnitario.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#valUnitarioCT").val( valUnitarioFormatado );
	
	//===========================================================================================================
	var freteItemCT = $("#freteItem___"+numLinha).val();
	if(freteItemCT != ""){
		var freteItem = parseFloat(freteItemCT);
		var freteFormatado = freteItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var freteItem = 0.00;
		var freteFormatado = freteItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#freteItemCT").val( freteFormatado );
	
	//===========================================================================================================	
	var descontoItemCT = $("#descontoItem___"+numLinha).val();
	if(descontoItemCT != ""){
		var descontoItem = parseFloat(descontoItemCT);
		var descontoFormatado = descontoItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var descontoItem = 0.00;
		var descontoFormatado = descontoItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#descontoItemCT").val( descontoFormatado );
	
	//===========================================================================================================
	var icmsItemCT = $("#icmsItem___"+numLinha).val();
	if(icmsItemCT != ""){
		var icmsItem = parseFloat(icmsItemCT);
		var icmsItemFormatado = icmsItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var icmsItem = 0.00;
		var icmsItemFormatado = icmsItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#icmsItemCT").val( icmsItemFormatado );
	
	//===========================================================================================================
	var ipiItemCT = $("#ipiItem___"+numLinha).val();
	if(ipiItemCT != ""){
		var ipiItem = parseFloat(ipiItemCT);
		var ipiFormatado = ipiItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var ipiItem = 0.00;
		var ipiFormatado = ipiItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#ipiItemCT").val( ipiFormatado );
	
	//===========================================================================================================
	var pisItemCT = $("#pisItem___"+numLinha).val();
	if(pisItemCT != ""){
		var pisItem = parseFloat(pisItemCT);
		var pisFormatado = pisItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var pisItem = 0.00;
		var pisFormatado = pisItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}	
	$("#pisItemCT").val( pisFormatado );
	
	//===========================================================================================================
	var cofinsItemCT = $("#cofinsItem___"+numLinha).val();
	if(cofinsItemCT != ""){
		var cofinsItem = parseFloat(cofinsItemCT);
		var cofinsFormatado = cofinsItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var cofinsItem = 0.00;
		var cofinsFormatado = cofinsItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#cofinsItemCT").val( cofinsFormatado );
	
	//===========================================================================================================
	var issItemCT = $("#issItem___"+numLinha).val();
	if(issItemCT != ""){
		var issItem = parseFloat(issItemCT);
		var issFormatado = issItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var issItem = 0.00;
		var issFormatado = issItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#issItemCT").val( issFormatado );
	
	//===========================================================================================================
	var inssItemCT = $("#inssItem___"+numLinha).val();
	if(inssItemCT != ""){
		var inssItem = parseFloat(inssItemCT);
		var inssFormatado = inssItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var inssItem = 0.00;
		var inssFormatado = inssItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#inssItemCT").val( inssFormatado );
	
	//===========================================================================================================
	var irItemCT = $("#irItem___"+numLinha).val();
	if(irItemCT != ""){
		var irItem = parseFloat(irItemCT);
		var irFormatado = irItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var irItem = 0.00;
		var irFormatado = irItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#irItemCT").val( irFormatado );
	
	//===========================================================================================================
	var csllItemCT = $("#csllItem___"+numLinha).val();
	if(csllItemCT != ""){
		var csllItem = parseFloat(csllItemCT);
		var csllFormatado = csllItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var csllItem = 0.00;
		var csllFormatado = csllItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#csllItemCT").val( csllFormatado );
	
	//===========================================================================================================
	var outroImpostoVlrItemCT = $("#outroImpostoVlrItem___"+numLinha).val();
	if(outroImpostoVlrItemCT != ""){
		var outroImpostoVlrItem = parseFloat(outroImpostoVlrItemCT);
		var outroImpostoVlrFormatado = outroImpostoVlrItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var outroImpostoVlrItem = 0.00;
		var outroImpostoVlrFormatado = outroImpostoVlrItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#outroImpostoVlrItemCT").val( outroImpostoVlrFormatado );
	
	
	//===========================================================================================================
	var totalItemCT = $("#totalItem___"+numLinha).val();
	if(totalItemCT != ""){
		var totalItemCT = $("#totalItem___"+numLinha).maskMoney('unmasked')[0];
		var totalItem = parseFloat(totalItemCT);
		var totalItemFormatado = totalItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var totalItem = 0.00;
		var totalItemFormatado = totalItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}	
	$("#totalItemCT").val( totalItemFormatado );
	
	$("#descItemCT").attr("readonly","readonly" );
	$("#codItemCT").attr("readonly","readonly" );
	$("#itemDisponibilizadoCT").attr("readonly","readonly" );
	$("#qtdSolicitadaCT").attr("readonly","readonly" );
	$("#qtdDisponibilizadaCT").attr("readonly","readonly" );
	$("#valUnitarioCT").attr("readonly","readonly" );
	$("#freteItemCT").attr("readonly","readonly" );
	$("#descontoItemCT").attr("readonly","readonly" );
	$("#icmsItemCT").attr("readonly","readonly" );
	$("#ipiItemCT").attr("readonly","readonly" );
	$("#pisItemCT").attr("readonly","readonly" );
	$("#cofinsItemCT").attr("readonly","readonly" );
	
	$("#issItemCT").attr("readonly","readonly" );
	$("#inssItemCT").attr("readonly","readonly" );
	$("#irItemCT").attr("readonly","readonly" );
	$("#csllItemCT").attr("readonly","readonly" );
	$("#outroImpostoDescCT").attr("readonly","readonly" );
	$("#outroImpostoVlrCT").attr("readonly","readonly" );
	
	$("#totalItemCT").attr("readonly","readonly" );
	$("#totalItemCT").css("background-color","#F3f3f3" );
	
	$("#infoComplItemSCCT").attr("readonly","readonly" );
	$("#infoComplItemFornecCT").attr("readonly","readonly" );
	
	$("#btnSaveItem").hide();
	$("#btnOcultaItem").show();
	
}
function visualizaItemCotacaoFinal(idCampo){
	console.log("##### entrou visualizaItemCotacaoFinal");
	var temp = idCampo.split("___");
	var numLinha = temp[1];
	console.log("tornando div divDetalhesItemCotacaoFinal visivel");
	$("#divDetalhesItemCotacaoFinal").show();
	
	$("#numLinhaItemCTF_resumo").val( numLinha );
	
	$("#descItemCTF_resumo").val( $("#descItemSolicitadoCTF___"+numLinha).val() );
	$("#codItemCTF_resumo").val( $("#codItemSolicitadoCTF___"+numLinha).val() );
	$("#itemDisponibilizadoCTF_resumo").val( $("#itemDisponibilizadoCTF___"+numLinha).val() );
	$("#qtdSolicitadaCTF_resumo").val( $("#qtdSolicitadaCTF___"+numLinha).val() );
	$("#qtdDisponibilizadaCTF_resumo").val( $("#qtdDisponibilizadaCTF___"+numLinha).val() );
	
	//console.log("infoComplItemSC___"+numLinha+": "+$("#infoComplItemSC___"+numLinha).val());
	$("#infoComplItemSCCTF_resumo").val( $("#infoComplItemSCCTF___"+numLinha).val() );
	$("#infoComplItemFornecCTF_resumo").val( $("#infoComplItemFornecCTF___"+numLinha).val() );
	
	//$("#btnSaveItem").show();
	
	//===========================================================================================================
	var valUnitarioCT = $("#valUnitarioCTF___"+numLinha).val();
	console.log("valUnitarioCTF antes do parseFloat: "+valUnitarioCT);
	if(valUnitarioCT != ""){
		var valUnitarioUnmasked = $("#valUnitarioCTF___"+numLinha).maskMoney('unmasked')[0];
		var valUnitario = parseFloat(valUnitarioUnmasked);
		console.log("valUnitarioCTF após parseFloat: "+valUnitario);
		var valUnitarioFormatado = valUnitario.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
		console.log("valUnitarioCTF após formatacao de moeda: "+valUnitarioFormatado);
	}else{
		var valUnitario = 0.00;
		var valUnitarioFormatado = valUnitario.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#valUnitarioCTF_resumo").val( valUnitarioFormatado );
	
	//===========================================================================================================
	var freteItemCT = $("#freteItemCTF___"+numLinha).val();
	if(freteItemCT != ""){
		var freteItem = parseFloat(freteItemCT);
		var freteFormatado = freteItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var freteItem = 0.00;
		var freteFormatado = freteItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#freteItemCTF_resumo").val( freteFormatado );
	
	//===========================================================================================================	
	var descontoItemCT = $("#descontoItemCTF___"+numLinha).val();
	if(descontoItemCT != ""){
		var descontoItem = parseFloat(descontoItemCT);
		var descontoFormatado = descontoItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var descontoItem = 0.00;
		var descontoFormatado = descontoItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#descontoItemCTF_resumo").val( descontoFormatado );
	
	//===========================================================================================================
	var icmsItemCT = $("#icmsItemCTF___"+numLinha).val();
	if(icmsItemCT != ""){
		var icmsItem = parseFloat(icmsItemCT);
		var icmsItemFormatado = icmsItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var icmsItem = 0.00;
		var icmsItemFormatado = icmsItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#icmsItemCTF_resumo").val( icmsItemFormatado );
	
	//===========================================================================================================
	var ipiItemCT = $("#ipiItemCTF___"+numLinha).val();
	if(ipiItemCT != ""){
		var ipiItem = parseFloat(ipiItemCT);
		var ipiFormatado = ipiItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var ipiItem = 0.00;
		var ipiFormatado = ipiItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}
	$("#ipiItemCTF_resumo").val( ipiFormatado );
	
	//===========================================================================================================
	var pisItemCT = $("#pisItemCTF___"+numLinha).val();
	if(pisItemCT != ""){
		var pisItem = parseFloat(pisItemCT);
		var pisFormatado = pisItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var pisItem = 0.00;
		var pisFormatado = pisItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}	
	$("#pisItemCTF_resumo").val( pisFormatado );
	
	//===========================================================================================================
	var cofinsItemCT = $("#cofinsItemCTF___"+numLinha).val();
	if(cofinsItemCT != ""){
		var cofinsItem = parseFloat(cofinsItemCT);
		var cofinsFormatado = cofinsItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var cofinsItem = 0.00;
		var cofinsFormatado = cofinsItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#cofinsItemCTF_resumo").val( cofinsFormatado );
	
	//===========================================================================================================
	var issItemCT = $("#issItemCTF___"+numLinha).val();
	if(issItemCT != ""){
		var issItem = parseFloat(issItemCT);
		var issFormatado = issItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var issItem = 0.00;
		var issFormatado = issItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#issItemCTF_resumo").val( issFormatado );
	
	//===========================================================================================================
	var inssItemCT = $("#inssItemCTF___"+numLinha).val();
	if(inssItemCT != ""){
		var inssItem = parseFloat(inssItemCT);
		var inssFormatado = inssItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var inssItem = 0.00;
		var inssFormatado = inssItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#inssItemCTF_resumo").val( inssFormatado );
	
	//===========================================================================================================
	var irItemCT = $("#irItemCTF___"+numLinha).val();
	if(irItemCT != ""){
		var irItem = parseFloat(irItemCT);
		var irFormatado = irItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var irItem = 0.00;
		var irFormatado = irItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#irItemCTF_resumo").val( irFormatado );
	
	//===========================================================================================================
	var csllItemCT = $("#csllItemCTF___"+numLinha).val();
	if(csllItemCT != ""){
		var csllItem = parseFloat(csllItemCT);
		var csllFormatado = csllItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var csllItem = 0.00;
		var csllFormatado = csllItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#csllItemCTF_resumo").val( csllFormatado );
	
	//===========================================================================================================
	var outroImpostoVlrItemCT = $("#outroImpostoVlrItemCTF___"+numLinha).val();
	if(outroImpostoVlrItemCT != ""){
		var outroImpostoVlrItem = parseFloat(outroImpostoVlrItemCT);
		var outroImpostoVlrFormatado = outroImpostoVlrItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var outroImpostoVlrItem = 0.00;
		var outroImpostoVlrFormatado = outroImpostoVlrItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}		
	$("#outroImpostoVlrItemCTF_resumo").val( outroImpostoVlrFormatado );
	
	//===========================================================================================================
	var totalItemCT = $("#totalItemCTF___"+numLinha).val();
	if(totalItemCT != ""){
		var totalItemCT = $("#totalItemCTF___"+numLinha).maskMoney('unmasked')[0];
		var totalItem = parseFloat(totalItemCT);
		var totalItemFormatado = totalItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}else{
		var totalItem = 0.00;
		var totalItemFormatado = totalItem.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
	}	
	$("#totalItemCTF_resumo").val( totalItemFormatado );
	
	$("#descItemCTF_resumo").attr("readonly","readonly" );
	$("#codItemCTF_resumo").attr("readonly","readonly" );
	$("#itemDisponibilizadoCTF_resumo").attr("readonly","readonly" );
	$("#qtdSolicitadaCTF_resumo").attr("readonly","readonly" );
	$("#qtdDisponibilizadaCTF_resumo").attr("readonly","readonly" );
	$("#valUnitarioCTF_resumo").attr("readonly","readonly" );
	$("#freteItemCTF_resumo").attr("readonly","readonly" );
	$("#descontoItemCTF_resumo").attr("readonly","readonly" );
	$("#icmsItemCTF_resumo").attr("readonly","readonly" );
	$("#ipiItemCTF_resumo").attr("readonly","readonly" );
	$("#pisItemCTF_resumo").attr("readonly","readonly" );
	$("#cofinsItemCTF_resumo").attr("readonly","readonly" );
	
	$("#issItemCTF_resumo").attr("readonly","readonly" );
	$("#inssItemCTF_resumo").attr("readonly","readonly" );
	$("#irItemCTF_resumo").attr("readonly","readonly" );
	$("#csllItemCTF_resumo").attr("readonly","readonly" );
	$("#outroImpostoDescCTF_resumo").attr("readonly","readonly" );
	$("#outroImpostoVlrCTF_resumo").attr("readonly","readonly" );
	
	$("#totalItemCTF_resumo").attr("readonly","readonly" );
	$("#totalItemCTF_resumo").css("background-color","#F3f3f3" );
	
	$("#infoComplItemSCCTF_resumo").attr("readonly","readonly" );
	$("#infoComplItemFornecCTF_resumo").attr("readonly","readonly" );

	$("#btnOcultaItemCTF").show();
	
}

function ocultaItemCotacao(){
	//console.log("entrou ocultaItemCotacao");
	$("#divDetalhesItemCotacao").hide();
	
	$("#totalItemCT").val( "" );
	
	$("#descItemCT").val("");
	$("#infoComplItemSCCT").val("");
	$("#qtdSolicitadaCT").val("");
	$("#totalItemCT").val("");
	$("#totalItemCT").css("background-color","#FFF" );
	
	$("#codItemCT").val("");
	$("#itemDisponibilizadoCT").val("");
	$("#qtdDisponibilizadaCT").val("");
	$("#valUnitarioCT").val("");
	$("#freteItemCT").val("");
	$("#descontoItemCT").val("");
	$("#icmsItemCT").val("");
	$("#ipiItemCT").val("");
	$("#pisItemCT").val("");
	$("#cofinsItemCT").val("");
	
	$("#issItemCT").val("");
	$("#inssItemCT").val("");
	$("#irItemCT").val("");
	$("#csllItemCT").val("");
	$("#outroImpostoDescCT").val("");
	$("#outroImpostoVlrCT").val("");
	
	$("#infoComplItemFornecCT").val("");
	
}

function ocultaItemCotacaoFinal(){
	//console.log("entrou ocultaItemCotacao");
	$("#divDetalhesItemCotacaoFinal").hide();
	
	$("#totalItemCTF_resumo").val( "" );
	
	$("#descItemCTF_resumo").val("");
	$("#infoComplItemSCCTF_resumo").val("");
	$("#qtdSolicitadaCTF_resumo").val("");
	$("#totalItemCTF_resumo").val("");
	$("#totalItemCTF_resumo").css("background-color","#FFF" );
	
	$("#codItemCTF_resumo").val("");
	$("#itemDisponibilizadoCTF_resumo").val("");
	$("#qtdDisponibilizadaCTF_resumo").val("");
	$("#valUnitarioCTF_resumo").val("");
	$("#freteItemCTF_resumo").val("");
	$("#descontoItemCTF_resumo").val("");
	$("#icmsItemCTF_resumo").val("");
	$("#ipiItemCTF_resumo").val("");
	$("#pisItemCTF_resumo").val("");
	$("#cofinsItemCTF_resumo").val("");
	
	$("#issItemCTF_resumo").val("");
	$("#inssItemCTF_resumo").val("");
	$("#irItemCTF_resumo").val("");
	$("#csllItemCTF_resumo").val("");
	$("#outroImpostoDescCTF_resumo").val("");
	$("#outroImpostoVlrCTF_resumo").val("");
	
	$("#infoComplItemFornecCTF_resumo").val("");
	
}


function verificaFiltroEmp(){
	console.log("entrou verificaFiltroEmp");
	/*var res = '';
		  var items = document.getElementsByName('filtroEmpresa');
		  for (var i = 0; i < items.length; i++) {
			if (items[i].checked) {
			  res = items[i].value
			  break;
			}
		  }  
		  console.log("valor filtroEmpresa: "+res);
		  if(res != ""){
			 $("#filtroEmpresaTXT").val(res);
			  
		  }*/
		  
	 $("#filtroEmpresaTXT").val($("#filtroEmpresa").val());
	
}

//##################################################################################
//FUNÇÃO EXIBE BOTAO DE UPLOAD
//##################################################################################
function exibeBtnUpload(conteudo){

		$("#btnUpload").show();
		$("#btnUploadOFF").hide();

		
}

function emiteAlertaDoc(){
	FLUIGC.toast({
		 title: '',
		 message: "Necessário informar uma descrição para o documento!",
		 type: 'danger'
	 });
	
}



function downloadDocumento(este, tbDoc){ 
	var campo = $(este).closest('tr').find('.exclude').attr('id');
	var idcampo = campo.split("___");
	var documento = $('#idDocumento${tbDoc}___${idcampo[1]}').val();
	var url = 'http://fluighml.vs.unimed.com.br:8080/webdesk/webdownload?documentId=${documento}&version=1000&tenantId=1';
	var win = window.open(url);
}

function excluirDocumento(este, tbDoc){
	var campo = $(este).closest('tr').find('.exclude').attr('id');
	var idcampo = campo.split("___");
	var usuario = $("#matAtual").val();

	var idDocumento = $('#idDocumento${tbDoc}___${idcampo[1]}').val();
	console.log(usuario + " " + idDocumento)
	var c1 = DatasetFactory.createConstraint("GUIA", idDocumento, idDocumento, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("USUARIO", usuario, usuario, ConstraintType.MUST);
	var constraints = new Array(c1,c2);

	var dataset = DatasetFactory.getDataset("dsDeleteDocument",null,constraints,null);

	var row = dataset.values[0];

	var id = varreTabela('tbDocs${tbDoc}');

	for(i=0;i<id.length;i++){
		if( $('#idDocumento${tbDoc}___${id[i]}').val() == idDocumento ){
			var par = $('#idDocumento${tbDoc}___${id[i]}').parent().parent(); //tr
		    par.remove();
		}
	}
}

function updateDocumento(documento){
	var c0 = DatasetFactory.createConstraint("documento", documento, documento, ConstraintType.MUST);
	var c1 = DatasetFactory.createConstraint("notificacao", false, false, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint("expira", false, false, ConstraintType.MUST);
	var dataset = DatasetFactory.getDataset("dsUpdateDocumentECM", null, new Array(c0, c1, c2), null);
}

function visualizarDocumento(este, tbDoc){
	var campo = $(este).closest('tr').find('.exclude').attr('id');
	var idcampo = campo.split("___");
	var documento = $('#idDocumento${tbDoc}___${idcampo[1]}').val();
	var url = "http://fluig.vs.unimed.com.br:8080/portal/p/1/ecmnavigation?app_ecm_navigation_doc="+documento;
	var win = window.open(url, '_blank');
	win.focus();
}

function registraDocumento(data, id){
	var pos = wdkAddChild("tbDocumentos");
	$("#nomeArquivoUpload___"+pos).val(data.content.description);
	$("#nomeDocumento___"+pos).val(data.content.description);
	$("#descDocumento___"+pos).val($("#descDocTemp").val());
	$("#numDocumento___"+pos).val(data.content.id);
	$("#dataUpload___"+pos).val(data.content.createDate);
	$("#codRespUpload___"+pos).val(data.content.colleagueId);
	$("#docReferente___"+pos).val($("#docReferenteTEMP option:selected").text());
	$("#codDocReferente___"+pos).val($("#docReferenteTEMP").val());
	
	var constraintColleague1 = DatasetFactory.createConstraint('colleaguePK.colleagueId', data.content.colleagueId, data.content.colleagueId, ConstraintType.MUST);
	var colunasColleague = new Array('colleagueName');
	var dataset = DatasetFactory.getDataset('colleague', colunasColleague, new Array(constraintColleague1), null);

	var row = dataset.values[0];
	
	$("#respUpload___"+pos).val(row["colleagueName"]);
	
	$("#descDocTemp").val("");
	$("#docReferenteTEMP").val("");
	
	btnDocumentos();
}

function pesquisaPasta(){
	console.log("entrou pesquisaPasta");
	
	var numPCEmp = $("#numPCEmp").val();
	var numSolicitacao = $("#numSolicitacao").val();
	var parentDocument = ID_PASTA_PAI;
	
	var descricao = numPCEmp+"_"+numSolicitacao;
	
	var c0 = DatasetFactory.createConstraint("descricao", descricao, descricao, ConstraintType.MUST);
	var dataset = DatasetFactory.getDataset("dsPesquisaPastaECM", null, new Array(c0), null);
	
	var folderID = "";
	
	for(var i=0;i<dataset.values.length;i++){
		var row = dataset.values[i];
		console.log("DS_PRINCIPAL_DOCUMENTO: "+row["DS_PRINCIPAL_DOCUMENTO"]);
		if(row["DS_PRINCIPAL_DOCUMENTO"] == ""){
			folderID = criarPasta(descricao, parentDocument);
		}else{
			ID_PASTA_UPLOAD = row["NR_DOCUMENTO"];
			folderID = row["NR_DOCUMENTO"];
		}
		
	}
	
	return folderID;
	
}

function criarPasta(nomePasta, parentDocument){
	console.log("entrou criarPasta");
	var codUsuario = $("#codSolicitante").val();

	var c0 = DatasetFactory.createConstraint('nomePasta', nomePasta, nomePasta, ConstraintType.MUST);
	var c1 = DatasetFactory.createConstraint('ParentDocument', parentDocument, parentDocument, ConstraintType.MUST);
	var c2 = DatasetFactory.createConstraint('publisher', codUsuario, codUsuario, ConstraintType.MUST);
	var constraints = new Array(c0, c1,c2);

	var dataset = DatasetFactory.getDataset("dsCriaPastaECM",null,constraints,null);
	var row = dataset.values[0];

	var dado = row["documentId"];
	
	console.log("Código pasta criada - documentId: "+dado);
	
	$("#diretorioPedido").val(dado);
	
	ID_PASTA_UPLOAD = dado;

	return dado;
}

function populaDocReferenteTEMP(){
	
	var tbGradeProdutos = varreTabela("tbGradeProdutos");
	var descricaoItem = new Array();
	
	$("#docReferenteTEMP option").remove();
	
	$("#docReferenteTEMP").append($('<option>', {
		value: "",
		text: "Cotação Geral"
	}));
	
	for(var i=0;i<tbGradeProdutos.length;i++){	
		$("#docReferenteTEMP").append($('<option>', {
			value: $("#codProdutoSC___"+tbGradeProdutos[i]).val(),
			text: $("#descrProdutoSC___"+tbGradeProdutos[i]).val()
		}));
	}

}

function btnDocumentos(){
	
	var id = varreTabela("tbDocumentos");
	
	var btn = "<a href=\"javascript:void(0);\" onclick=\"visualizaDocumento(this)\"><span class=\"fluigicon fluigicon-eye-open fluigicon-xl\" style=\"color:#4682B4;font-size:22px;\"></span></a>"+
		"&nbsp;&nbsp;&nbsp;&nbsp;<a onclick=\"excluiDocumento(this)\" href=\"javascript:void(0);\"><span class=\"fluigicon fluigicon-remove-circle fluigicon-lg\" style=\"color:#8B0000;font-size:18px;\"></span></a>";
	
	$("#tbDocumentos tbody tr .acoestbDocumentos").each(function(){
		var campo = $(this).attr("id");
		var pos = campo.lastIndexOf("___");
		if(pos > 0){
			var elemento = $(this).prev();
			$(elemento).html('');
		}
	});

	$("#tbDocumentos tbody tr .acoestbDocumentos").each(function(){
		var campo = $(this).attr("id");
		var pos = campo.lastIndexOf("___");
		
		if(pos > 0){
			var elemento = $(this).prev();
			var elemento2 = $(this).parent().parent().find('td').first().find('.exclude').attr('id');
			var pos2 = elemento2.split("___");
		
			$(elemento).append(btn);				
		}
	});
	
}


function visualizaDocumento(idDocumento){
	console.log("entrou visualizaDocumento");
	var pos = idDocumento.split("___");
	console.log("pos: "+pos);
	
	var idDocumento = $("#idDocumento___"+pos[1]).val();
		
	var destino = URL_FLUIG+"/portal/p/1/ecmnavigation?app_ecm_navigation_doc="+idDocumento;
	console.log("DESTINO:");
	console.log(destino);
	
	window.open(URL_FLUIG+"/portal/p/1/ecmnavigation?app_ecm_navigation_doc="+idDocumento, "_blank");
}

//##################################################################################
//FUNÇÃO EXCLUI DOCUMENTO DO ECM
//##################################################################################
function excluiDocumento(idDocumento){
	console.log("entrou excluiDocumento");
	var pos = idDocumento.split("___");
	console.log("pos: "+pos);

	
	FLUIGC.message.confirm({
		message: 'Deseja realmente excluir este arquivo?',
		title: 'Atenção',
		labelYes: 'Ok',
		labelNo: 'Cancelar'
	}, function(result, el, ev) {				 
	  if(result==true){	 	
			var idDocumento = $("#idDocumento___"+pos[1]).val();
			console.log("idDocumento: "+idDocumento);
			var codUser = $("#codUsuario").val();
			var c1 = DatasetFactory.createConstraint("DOC", idDocumento, idDocumento, ConstraintType.MUST);
			var c2 = DatasetFactory.createConstraint("codUsuario", codUser ,codUser, ConstraintType.MUST);
			var constraints = new Array(c1,c2);
			var dataset = DatasetFactory.getDataset("dsDeleteDocument",null,constraints,null);
		
			FLUIGC.toast({
				title: '',
				message: 'Documento excluído com sucesso!',
				type: 'success'
			});
			
			recriaTabelaDocs();
			
	  }
	});	
	
	
}

function recriaTabelaDocs(){
	console.log("entrou recriaTabelaDocs");
	
	var parentID = $("#diretorioPedido").val();
	console.log("parentID: "+parentID);
	
	if(parentID == "" || parentID == undefined || parentID == "undefined"){
		console.log("NAO ENCONTROU DIRETÓRIO CRIADO");
		var parentID = pesquisaPasta();
		console.log("DIRETÓRIO CRIADO: "+parentID);
	}
	
	//var documentos = listaDocumentos(parentID);
	
	var c0 = DatasetFactory.createConstraint('parentID', parentID, parentID, ConstraintType.MUST);
	var dataset = DatasetFactory.getDataset('dsBuscaDocsPastaECM', null, new Array(c0), null);

	
	
	var strTabela = "";
	
	$("#contentTbDocumentos").html("");
	var contLinha = 0;
	for(var i=0;i<dataset.values.length;i++){	
		contLinha++;
		
		var row = dataset.values[i];
		
		var codDocumento = row["idDocumento"];
		var doc = row["descricao"];
		var dateUpload = row["dataUpload"];
		var dataCriacao = new Date(dateUpload);
		
		var diaLog = dataCriacao.getDate();
		if (parseInt(diaLog) < 10) {
			diaLog = "0" + diaLog;
		}
		var mesLog = dataCriacao.getMonth();

		var anoLog = dataCriacao.getFullYear();

		var mes2Log = parseInt(mesLog) + 1;
		if (parseInt(mes2Log) < 10) {
			mes2Log = "0" + mes2Log;
		}

		var dataFormatada = diaLog + '/' + mes2Log + '/' + anoLog;
		
		var OBJ = doc.split("_");
		
		var docReferente = OBJ[2];
		var arquivo = OBJ[3];
		var respUpload = OBJ[1];
		
		
		
		/*
		createDate
		documentDescription
		parentDocumentId
		documentId
		documentType
		fileUrl
		physicalFileName
		publisherId
		publisherName
		version
	*/
		
		strTabela += "<tr>";
			strTabela += "<td>";
				strTabela += "<input type='hidden' class='exclude'  id='excludetbDocumentos___"+contLinha+"''>";
				strTabela += "<input type='hidden' class='form-control' id='numDocumento___"+contLinha+"''>";
				strTabela += "<input type='hidden' id='idDocumento___"+contLinha+"'' value='"+row["idDocumento"]+"'>";
				strTabela += "<input type='hidden' id='idDiretorio___"+contLinha+"'' value='"+row["parentId"]+"'>";
				strTabela += "<span>"+contLinha+"</span>";
			strTabela += "</td>";
			
			strTabela += "<td>";
				strTabela += "<input type='hidden' class='form-control' id='codDocReferente___"+contLinha+"''>";
				strTabela += "<input type='hidden' class='form-control' id='docReferente___"+contLinha+"'' >";
				strTabela += "<span>"+docReferente+"</span>";
			strTabela += "</td>";
			
			strTabela += "<td>";
				strTabela += "<input type='hidden' class='form-control' id='nomeDocumento___"+contLinha+"'' value='"+row["descricao"]+"'>";
				strTabela += "<span>"+arquivo+"</span>";
			strTabela += "</td>";
			
			strTabela += "<td>";
				strTabela += "<input type='hidden' class='form-control' id='descDocumento___"+contLinha+"'' value='"+row["descricao"]+"'>";
				strTabela += "<input type='hidden' class='form-control' id='nomeArquivoUpload___"+contLinha+"'' value='"+row["descricao"]+"'>";
				strTabela += "<span>"+row["descricao"]+"</span>";
			strTabela += "</td>";
			
			strTabela += "<td>";
				strTabela += "<input type='hidden' class='form-control' id='respUpload___"+contLinha+"'' value='"+row["publisherId"]+"'>";
				strTabela += "<input type='hidden' class='form-control' id='codRespUpload___"+contLinha+"'' value='"+respUpload+"'>";
				strTabela += "<span>"+respUpload+"</span>";
			strTabela += "</td>";
			
			strTabela += "<td>";
				strTabela += "<span>"+dataFormatada+"</span>";
			strTabela += "</td>";
			
			strTabela += "<td class=''>";
				strTabela += "<div id='DIVbtnTbDocumentos' style='text-align:center;'></div>";
				strTabela += "<input type='hidden' class='acoestbDocumentos___"+contLinha+"'' name='acoesTbDocumentos___"+contLinha+"'' id='acoesTbDocumentos' >";
				strTabela += "<div class='btn-group'>" +
								"<button type='button' class='btn btn-info' onclick='visualizaDocumento(this.id)' id='btnDoc___" + contLinha +"' >Visualizar</button>";
								
								if(OBJ[0] == "COMPRAS"){
									strTabela += "<button type='button' class='btn btn-danger' onclick='excluiDocumento(this.id)' id='btnExcludeDoc___" + contLinha +"' >Excluir</button>";
								}								
								
							strTabela += "</div>";
			strTabela += "</td>";
			
		strTabela += "</tr>";
		
	}
	
	$("#contentTbDocumentos").html(strTabela);
	
	//btnTbDocumentos();
	
}

function posicionaPainel(painel){
	setTimeout(function(){
		location.href = painel;
	}, 500);
}




function ocultaTbGradeProdutos(){
	//console.log("entrou ocultaTbGradeProdutos");
	limpaTbProdutoSCTemp();
	$(".divTempProdutos").hide();
	$("#ocultaProdutoSC").hide();
}
	
function alteraTXTOBJ(campo) {
	$("#" + campo + "TXT").val($("#" + campo).val());
	
	$("#"+campo+"TXT").val($("#"+campo+" option:selected").text());
		
	var objTXT = new Array();
	objTXT.push({
		'selecionado':$('#'+campo).val(),
		'text': $('#'+campo+' option:selected').text()
	});
	var obj = JSON.stringify(objTXT);
	$("#"+campo+"OBJ").val(obj);

}







