function getSolicitanteCompras() {
	console.log("entrou getSolicitanteCompras");
	
	var codUsuario = $("#codUsuario").val();
	
	if( $("#codUsuario").val() != ""){
		console.log("entrou if");
		$.ajax({
			type: "GET",
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			url: 'https://abainfraestrutura147637.protheus.cloudtotvs.com.br:3016/rest/PERM_SOLICITANTE',
			data: { CODUSUARIO: codUsuario },
			dataType: 'json',
			contentType: "application/json",
			crossDomain:true,
			success: function(res, status, xhr){
				if(res.length <= 0){
					$("#msgErroUserSC").show();	
						setTimeout(function() {
							$("#msgErroUserSC").hide();
						}, 5000);						
				}else{
					if(res[0].ACESSO != "T"){
						$("#msgErroUserSC").show();	
						setTimeout(function() {
							$("#msgErroUserSC").hide();
						}, 5000);	
					}else{
						$("#existeUserProtheus").val("SIM");
						$("#msgErroUserSC").hide();
					}
					
				}
				
				
			}
		});	
	}

}

function criaSolicitacaDeCompra(){
	console.log("entrou criaSolicitacaDeCompra: ");
	
	var contValidaInicio = validaAtivInicio("CRIASC");
	
	if($("#numSC").val() == "" && contValidaInicio == 0){
		console.log("entrou primeiro if");
		$("#btnGeraSC").attr("disabled","disabled");
		
		var myLoading2 = FLUIGC.loading(window);
		// We can show the message of loading
		myLoading2.show();
		
		var empresaOBJTXT = $("#empresaOBJ").val();
		var empresaOBJ = JSON.parse(empresaOBJTXT);
		
		var codEmp = empresaOBJ[0].selecionado;
		
		
		var dados = preparaIntegracao();
		console.log("JSON ORIGINAL: ");
		console.log(dados[0]);
		var STR = JSON.stringify(dados[0]);
		console.log("JSON TXT: ");
		console.log(STR);
		var settings = {
		  "url": "https://abainfraestrutura147637.protheus.cloudtotvs.com.br:3016/rest/WS_SOL_COMPRAS?FILIAL= ",
		  "method": "POST",
		  "timeout": 0,
		  "headers": {
			"Content-Type": "application/json"
		  },
		  "data": STR,
		};

		$.ajax(settings).done(function (data, textStatus, jqXHR) {
			
			$("#msgSucessoIntegracaoSC").show();
			$("#msgErroIntegracaoSC").hide();
			
			$("#numSC").val(data[0].NUMERO);
			$("#numSCEmp").val(codEmp+"-"+data[0].NUMERO);
			$("#codeSucessoIntegracaoSC").html("");
			$("#codeSucessoIntegracaoSC").append(data[0].NUMERO);
			$("#produtoTemp").select2("destroy");
			$("#centroCustoTemp").select2("destroy");
			
			btnTbProdutosTempSC("SOMENTE_LEITURA");
			
			console.log("SUCESSO");
			// We can hide the message of loading
			myLoading2.hide();
		}).fail(function(jqXHR, textStatus, errorThrown) {
			$("#codeErroIntegracaoSC").html("");
			
			$("#msgSucessoIntegracaoSC").hide();
			$("#msgErroIntegracaoSC").show();
			
			setTimeout(function() {
						$("#msgErroIntegracaoSC").hide();
					}, 5000);	
			
			$("#codeErroIntegracaoSC").append(jqXHR.status+ " - Internal Server Error");
			console.log("FALHA");
			console.log("jqXHR: "+jqXHR);
			console.log("textStatus: "+textStatus);
			console.log("errorThrown: "+errorThrown);
			$("#btnGeraSC").removeAttr("disabled");
			myLoading2.hide();
			$("#msgErroValidaInicio").hide();
		});	
	}if($("#numSC").val() == "" && contValidaInicio > 0){
		console.log("entrou segundo if");
		$("#msgErroValidaCriaSC").show();
		setTimeout(function() {
						$("#msgErroValidaCriaSC").hide();
					}, 5000);	
	}if($("#numSC").val() != ""){
		console.log("entrou terceiro if");
		btnTbProdutosTempSC("SOMENTE_LEITURA");
		alert("Solicitação de Compras já criada!")
		$("#msgErroValidaCriaSC").hide();
	}
	
		
}

function preparaIntegracao(){
	
	var empresa = $("#empresaTXT").val();
	
	var empresaOBJ = JSON.parse($("#empresaOBJ").val());
	
	var filial = empresaOBJ[0].selecionado;
	var codSolicitante = $("#codUsuario").val();
	var solicitante = $("#solicitante").val();
	var idUserProtheus = $("#idUserProtheus").val();
	
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

	var dataFormatada = anoLog+mes2Log+diaLog;
	
	var dataEmissao = dataFormatada;
	
	var itens = new Array();
	var dados = new Array();
	
	var tbProdutos = varreTabela("tbGradeProdutos");
	var cont = 0;
	for (var i = 0; i < tbProdutos.length; i++) {
		var numItem = "";
		var codProduto = $("#codProdutoSC___" + tbProdutos[i]).val();
		var quantidade = $("#quantidadeSC___" + tbProdutos[i]).val();
		var ccusto = $("#codCentroCustoSC___" + tbProdutos[i]).val();
		var observacao = $("#observacaoSC___" + tbProdutos[i]).val();
		var categoria = $("#codCategoriaItemSC___" + tbProdutos[i]).val();
		
		var dataNecessidade = $("#dataNecessidadeFormatada").val();
		
		itens.push(
			{
				"codProduto": codProduto,
				"quantidade": quantidade,
				"ccusto": ccusto,
				"observacao": observacao,
				"categoria" : categoria,
				"dataNecessidade": dataNecessidade
			}
		);
	}
	
	dados.push(
		{
			"empresa":empresa,
			"filial": filial,
			"codSolicitante":codSolicitante,
			"solicitante": solicitante,
			"dataEmissao": dataFormatada,
			"idProtheus": idUserProtheus,
			"itens":itens
		}
	);
	
	return dados;
	
}

function criaPedidoCompras(){
	
	var contErro = validaCriacaoPedido();
	var tbItensPedido = varreTabela("tbItensPedido");
	
	if(tbItensPedido.length == 0){
		$("#msgErroTbItens").show();
	}else{
		$("#msgErroTbItens").hide();
	}
	
	if(contErro == 0 && tbItensPedido.length > 0){
		var empresa = $("#empresaTXT").val();
		var empresaOBJ = JSON.parse($("#empresaOBJ").val());
		var empresaOBJTXT = $("#empresaOBJ").val();
		var empresaOBJ = JSON.parse(empresaOBJTXT);
		
		var codEmp = empresaOBJ[0].selecionado;
		var filial = empresaOBJ[0].selecionado;
		var codSolicitante = $("#codUsuario").val();
		var solicitante = $("#solicitante").val();
		var idUserProtheus = $("#idUserProtheus").val();
		
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

		var dataFormatada = anoLog+mes2Log+diaLog;
		
		var dataEmissao = dataFormatada;
		
		var itens = new Array();
		var dados = new Array();
		
		var tbCotacaoFinal = varreTabela("tbCotacaoFinal");
		var tbItensCotacaoFinal = varreTabela("tbItensPedido");
		
		var itens = new Array();
		var dados = new Array();
		var codFornec = $("#codFornec").val();
		var cnpjCabecalho = $("#cnpj").val();
		var razaoSocial = $("#razaoSocial option:selected").text();
		var loja = $("#loja").val();
		var condPagamento = $("#condPagamentoCTFTXT").val();
		var tipoPedido = $("#tipoPedidoCTFTXT").val();
		var tipoFrete = $("#tipoFreteCTFTXT").val();
		var contato = $("#contato").val();
		var categoria = "";
		var dataNecessidade = $("#dataEmissaoFormatada").val();
		var totalFrete = $("#totalFrete").val();
		var totalDespesa = $("#totalDespesa").val();
		var totalDesconto = $("#totalDesconto").val();
		
		if(totalFrete != ""){
			if (totalFrete.indexOf('R$') > -1){
				var totalFreteTXT = $("#totalFrete").maskMoney('unmasked')[0];
				var totalFreteFloat = parseFloat(totalFreteTXT);
				totalFreteFloat = totalFreteFloat.toFixed(2);
				var totalFreteString = totalFreteFloat.toString();
			}else{
				var totalFreteFloat = parseFloat(totalFrete);
				totalFreteFloat = totalFreteFloat.toFixed(2);
				var totalFreteString = totalFreteFloat.toString();
			}
		}else{
			var totalFreteString = "0.00"
		}
		
		if(totalDespesa != ""){
			if (totalDespesa.indexOf('R$') > -1){
				var totalDespesaTXT = $("#totalDespesa").maskMoney('unmasked')[0];
				var totalDespesaFloat = parseFloat(totalDespesaTXT);
				totalDespesaFloat = totalDespesaFloat.toFixed(2);
				var totalDespesaString = totalDespesaFloat.toString();
			}else{
				var totalDespesaFloat = parseFloat(totalDespesa);
				totalDespesaFloat = totalDespesaFloat.toFixed(2);
				var totalDespesaString = totalDespesaFloat.toString();
			}
		}else{
			var totalDespesaString = "0.00"
		}
		
		if(totalDesconto != ""){
			if (totalDesconto.indexOf('R$') > -1){
				var totalDescontoTXT = $("#totalDesconto").maskMoney('unmasked')[0];
				var totalDescontoFloat = parseFloat(totalDescontoTXT);
				totalDescontoFloat = totalDescontoFloat.toFixed(2);
				var totalDescontoString = totalDescontoFloat.toString();
			}else{
				var totalDescontoFloat = parseFloat(totalDesconto);
				totalDescontoFloat = totalDescontoFloat.toFixed(2);
				var totalDescontoString = totalDescontoFloat.toString();
			}
		}else{
			var totalDescontoString = "0.00"
		}
		
		var prevEntrega = $("#dataPrevItemCT").val();
		var prevEntregaTXT = prevEntrega.split("/");
		var prevEntregaFormat = prevEntregaTXT[2].toString()+prevEntregaTXT[1].toString()+prevEntregaTXT[0].toString();

		for(var z = 0; z < tbItensCotacaoFinal.length; z++){
			var codProduto = $("#codItemSolicitado___" + tbItensCotacaoFinal[z]).val();
			var unidade = $("#uniMedProduto___" + tbItensCotacaoFinal[z]).val();
			var quantidade = $("#qtdItem___" + tbItensCotacaoFinal[z]).val();
			var quantFloat = parseFloat(quantidade);
			//var precoUnitario = $("#valUnitarioCTF___" + tbItensCotacaoFinal[z]).val();
			
			var precoUnitario = $("#valUnitario___"+tbItensCotacaoFinal[z]).maskMoney('unmasked')[0];
			var precoUnitarioFloat = parseFloat(precoUnitario);
			var precoUnitString = precoUnitarioFloat.toString();
			
			//var total = $("#totalItemCTF___" + tbItensCotacaoFinal[z]).val();
			
			var total = quantidade * precoUnitarioFloat;
			var totalFloat = parseFloat(total.toFixed(2));
			var totalSting = totalFloat.toString();
			
			var itemSC = $("#numItem___" + tbItensCotacaoFinal[z]).val();
			var numeroSC = $("#numSC").val();
			var observacao = $("#infoComplItem___" + tbItensCotacaoFinal[z]).val();
			var infoComplementar = $("#infoComplItem___" + tbItensCotacaoFinal[z]).val();
			var centroCusto = $("#codCentroCusto___" + tbItensCotacaoFinal[z]).val();
			var contaContabil = $("#contaContabProd___" + tbItensCotacaoFinal[z]).val();
			var itemConta = $("#itemContaProd___" + tbItensCotacaoFinal[z]).val();
			var vlrDesconto = $("#descontoItemCTF___" + tbItensCotacaoFinal[z]).val();
			
			if(vlrDesconto != ""){
				
				if (vlrDesconto.indexOf('R$') > -1){
					console.log("achou R$ em vlrDesconto");
					var vlrDesconto = parseFloat(vlrDesconto.replace(/[^0-9,]*/g, '').replace(',', '.')).toFixed(2);
				}else{
					console.log("não achou R$ em vlrDesconto");
					var vlrDescontoSTR = $("#descontoItemCTF___"+tbItensCotacaoFinal[i]).maskMoney('unmasked')[0];
					var vlrDesconto = parseFloat(vlrDescontoTXT);
					var vlrDescontoFloat = vlrDesconto.toFixed(2);
					var vlrDescontoString = vlrDescontoFloat.toString();
				}
				
				//var vlrDescontoTXT = $("#descontoItemCTF___"+tbItensCotacaoFinal[i]).maskMoney('unmasked')[0];
				
				

			}else{
				var vlrDescontoString = "0.00";
			}
			
			itens.push(
				{
					"codProduto": codProduto,
					"unidade": unidade,
					"quantidade": quantidade,
					"precoUnitario": precoUnitString,
					"total" : totalSting,
					"itemSC": itemSC,
					"numeroSC": numeroSC,
					"observacao": observacao,
					"infoComplementar": infoComplementar,
					"centroCusto": centroCusto,
					"contaContabil": contaContabil,
					"itemConta": itemConta,
					"vlrDesconto": vlrDescontoString
				}
			);
		}
		
		
		dados.push(
			{
				"empresa":empresa,
				"filial": filial,
				"codSolicitante":codSolicitante,
				"codFornec":codFornec,
				"cnpjCabecalho": cnpjCabecalho,
				"razaoSocial": razaoSocial,
				"loja":loja,
				"condPagamento": condPagamento,
				"contato": contato,
				"categoria": categoria,
				"dataNecessidade":dataNecessidade,
				"totalFrete":totalFreteString,
				"totalDespesa":totalDespesaString,
				"totalDesconto":totalDescontoString,
				"prevEntrega":prevEntregaFormat,
				"tipoPedido":tipoPedido,
				"tipoFrete":tipoFrete,
				"origem": "PEDIDO_DIRETO",
				"itens": itens
			}
		);

		console.log("JSON ORIGINAL PC: ");
		console.log(dados[0]);
		var STR = JSON.stringify(dados[0]);
		console.log("JSON TXT: ");
		console.log(STR);
		var settings = {
		  "url": "https://abainfraestrutura147637.protheus.cloudtotvs.com.br:3016/rest/WS_PEDIDO_COMPRAS?FILIAL= ",
		  "method": "POST",
		  "timeout": 0,
		  "headers": {
			"Content-Type": "application/json"
		  },
		  "data": STR,
		};

		$.ajax(settings).done(function (data, textStatus, jqXHR) {
			
			console.log("NUMERO PC CRIADO: "+data[0].NUMERO);
			
			/*for(var i=0;i<data.length;i++){
				var linha = wdkAddChild("tbPedidos");
				
				$("#codFornecPED___"+linha).val(codFornec);
				$("#cnpjPED___"+linha).val(cnpjCabecalho);
				$("#razaoSocialPED___"+linha).val(razaoSocial);
				$("#numPedido___"+linha).val(data[0].NUMERO);
				
			}*/
			
			$("#msgSucessoIntegracaoSC").show();
			$("#msgErroIntegracaoSC").hide();
			
			$("#numPC").val(data[0].NUMERO);
			$("#numPCEmp").val(codEmp+"-"+data[0].NUMERO);
			$("#codeSucessoIntegracaoSC").html("");
			$("#codeSucessoIntegracaoSC").append(data[0].NUMERO);
			$("#produtoTemp").select2("destroy");
			$("#centroCustoTemp").select2("destroy");
			$("#statusPedido").val("PENDENTE");
			
		}).fail(function(jqXHR, textStatus, errorThrown) {
			console.log("ERRO CRIACAO PC");
		});	

		
		$("#btnGeraPC").attr("disabled","disabled");
		$("#msgErroValidaCriaSC").hide();
	}else{
		$("#msgErroValidaCriaSC").show();
	}
	
	
	
	return dados;
	
}

function getVerificaUserProtheus() {
	console.log("entrou getVerificaUserProtheus");
	
	var codUsuario = $("#codUsuario").val();
	
	if( $("#codUsuario").val() != ""){
		console.log("entrou if");
		$.ajax({
			type: "GET",
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			url: 'https://abainfraestrutura147637.protheus.cloudtotvs.com.br:3016/rest/USER_PROTHEUS',
			data: { CODUSUARIO: codUsuario },
			dataType: 'json',
			contentType: "application/json",
			crossDomain:true,
			success: function(res, status, xhr){
				if(res.length <= 0){
					$("#msgErroUserSC").show();	

					setTimeout(function() {
						$("#msgErroUserSC").hide();
					}, 5000);					
				}else{
					console.log(res[0].IDUSER)
					$("#idUserProtheus").val(res[0].IDUSER);
									
				}
				
				
			}
		});	
	}

}

function getEmpresa() {
	console.log("entrou getEmpresa");
	$("#empresa option").remove();	
	$('#empresa').val(null).trigger('change');	
	
	$("#empresa").select2({
		minimumInputLength: 2,
		ajax:{
			type: "GET",
			//beforeSend: function (xhr) {
			//	xhr.setRequestHeader('Authorization', 'Basic YWxvaXNpby5sb3VyZW5jbzoxMjM0NTY=');
			//},
			url: URL_TOTVS+'/LISTA_EMPRESAS',
			data: function (params) {
				var str = params.term
				return {
				  DESCEMPRESA: str.toUpperCase()
				};
			},
			dataType: 'json',
			crossDomain:true,
			processResults: function (data) {
				var dados = []
				
				data.sort(compareSecondColumn);

				function compareSecondColumn(a, b) {
					if (a[1] === b[1]) {
						return 0;
					}
					else {
						return (a[1] < b[1]) ? -1 : 1;
					}
				}
				//console.log("data.length: "+data.length)
				for(var i=0;i<data.length;i++){
					//console.log("data[i].CODIGO: "+data[i].CODIGO);
					if(data[i].CODEMP == "undefined" || data[i].CODEMP == undefined){
						dados.push({
							'id':"",
							'text':"Cadastro não encontrado"
						})
					}else{
						dados.push({
							'id':data[i].CODEMP,
							'text':data[i].CODEMP+" - "+data[i].NOMEEMP
						})
					}
				}
				
				/*if(data.length == 0){
						dados.push({
							'id':"",
							'text':"Cadastro não encontrado"
						})
				}*/
				
				return {
					results: dados
				};
			}
		},escapeMarkup: function (m) { return m; }
	});
	$("#empresa").attr("onchange","validaEdicao(this.id,'select2')");

}

function getFiliais(codEmpresa) {
	console.log("entrou getFiliais");
	$("#filial option").remove();
	console.log("existe: "+$("input[type=hidden][name=existeUserProtheus]").val());
	
	if(codEmpresa != ""){
		
		var codEmp = codEmpresa.substr(0, 2);
		var codFilial = codEmpresa.substr(2,4);
		
		$.ajax({
			type: "GET",
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			url: URL_TOTVS + '/LISTA_FILIAIS',
			data: { 
					CODEMPRESA:	codEmp,
					FILIAL: codFilial
					},
			dataType: 'json',
			contentType: "application/json",
			crossDomain: true,
			success: function (res, status, xhr) {
				
				if(res.length > 1){
					$("#filial").append($('<option>', {
						value: "",
						text: "Selecione"
					}));
					
					for(var i=0; i<res.length;i++){
					
						$("#filial").append($('<option>', {
							value: res[i].COD_FILIAL,
							text: res[i].COD_FILIAL+" - "+res[i].FILIAL
						}));
					}
					
					getProduto();
					getCentroCusto();
					
				}else{
					$("#filial").append($('<option>', {
						value: res[0].COD_FILIAL,
						text: res[0].COD_FILIAL+" - "+res[0].FILIAL
					}));
					
					$("#filialTXT").val(res[0].COD_FILIAL);
					
					var filial = new Array();
					filial.push({
						'selecionado':res[0].COD_FILIAL,
						'text': res[0].COD_FILIAL+" - "+res[0].FILIAL
					});
					var obj = JSON.stringify(filial);
					$("#filialOBJ").val(obj);
					
					getProduto();
					getCentroCusto();
				}
				
				

			}
		});
	}
	validaEdicao('filial','select');

}

function getProduto(){
	
	$("#produtoTemp option").remove();	
	$('#produtoTemp').val(null).trigger('change');	
	
	var filial = $("#filialTXT").val();
	console.log("FILIAL getProduto: "+filial);
	
	$("#produtoTemp").select2({
		minimumInputLength: 2,
		ajax:{
			type: "GET",
			//beforeSend: function (xhr) {
			//	xhr.setRequestHeader('Authorization', 'Basic YWxvaXNpby5sb3VyZW5jbzoxMjM0NTY=');
			//},
			url: URL_TOTVS+'/RETPROD',
			data: function (params) {
				var str = params.term
				return {
				  FILIAL: filial,
				  CODIGO: str.toUpperCase(),
				  DESCRICAO: str.toUpperCase(),
				  FILTRO: 'DESCRICAO'
				};
			},
			dataType: 'json',
			crossDomain:true,
			processResults: function (data) {
				var dados = []
				
				data.sort(compareSecondColumn);

				function compareSecondColumn(a, b) {
					if (a[1] === b[1]) {
						return 0;
					}
					else {
						return (a[1] < b[1]) ? -1 : 1;
					}
				}
				//console.log("data.length: "+data.length)
				for(var i=0;i<data.length;i++){
					//console.log("data[i].CODIGO: "+data[i].CODIGO);
					if(data[i].CODIGO == "undefined" || data[i].CODIGO == undefined){
						dados.push({
							'id':"",
							'text':"Cadastro não encontrado"
						})
					}else{
						dados.push({
							'id':data[i].CODIGO,
							'text':data[i].CODIGO+" - "+data[i].DESCRICAO
						})
					}
				}
				
				/*if(data.length == 0){
						dados.push({
							'id':"",
							'text':"Cadastro não encontrado"
						})
				}*/
				
				return {
					results: dados
				};
			}
		},escapeMarkup: function (m) { return m; }
	});
	$("#produtoTemp").attr("onchange","validaEdicao(this.id,'select2'),getComplProd()");
}

function getCentroCusto(){
	
	$("#centroCustoTemp option").remove();	
	$('#centroCustoTemp').val(null).trigger('change');	
	
	var filial = $("#filialTXT").val();
	console.log("FILIAL getProduto: "+filial);
	
	$("#centroCustoTemp").select2({
		minimumInputLength: 2,
		ajax:{
			type: "GET",
			//beforeSend: function (xhr) {
			//	xhr.setRequestHeader('Authorization', 'Basic YWxvaXNpby5sb3VyZW5jbzoxMjM0NTY=');
			//},
			url: URL_TOTVS+'/WS_CCUSTO',
			data: function (params) {
				var str = params.term
				return {
				  FILIAL: filial,
				  DESCRICAO: str.toUpperCase()
				};
			},
			dataType: 'json',
			crossDomain:true,
			processResults: function (data) {
				var dados = []
				
				data.sort(compareSecondColumn);

				function compareSecondColumn(a, b) {
					if (a[1] === b[1]) {
						return 0;
					}
					else {
						return (a[1] < b[1]) ? -1 : 1;
					}
				}
				console.log("data.length: "+data.length)
				for(var i=0;i<data.length;i++){
					console.log("data[i].CODIGO: "+data[i].CODIGO);
					if(data[i].CODIGO == "undefined" || data[i].CODIGO == undefined){
						dados.push({
							'id':"",
							'text':"Cadastro não encontrado"
						})
					}else{
						dados.push({
							'id':data[i].CODIGO,
							'text':data[i].CODIGO+" - "+data[i].DESCRICAO
						})
					}
					
					var label = $("#centroCustoTemp").prev().prev();
					$(label).css('color', '');
					
				}
				return {
					results: dados
				};
			}
		},escapeMarkup: function (m) { return m; }
	});
	
	$("#centroCustoTemp").attr("onchange","validaEdicao(this.id,'select2')");
	
}

function getFornecedor(){
	
	$("#razaoSocial option").remove();	
	$('#razaoSocial').val(null).trigger('change');	
	
	if($("#filtroEmpresaTXT").val() != ""){
		var filtroEmpresa = $("#filtroEmpresaTXT").val();
	}else{
		var filtroEmpresa = "DESCRICAO";
	}
		
	$("#razaoSocial").select2({
		minimumInputLength: 2,
		ajax:{
			type: "GET",
			//beforeSend: function (xhr) {
			//	xhr.setRequestHeader('Authorization', 'Basic YWxvaXNpby5sb3VyZW5jbzoxMjM0NTY=');
			//},
			url: URL_TOTVS+'/WS_FORNECEDORES',
			data: function (params) {
				var str = params.term
				var filtroEmp = $("#filtroEmpresaTXT").val() ;
				return {
				  DESCRICAO: str.toUpperCase(),
				  CNPJ: str.toUpperCase(),
				  FILTRO: filtroEmp
				};
			},
			dataType: 'json',
			crossDomain:true,
			processResults: function (data) {
				var dados = []
				
				data.sort(compareSecondColumn);

				function compareSecondColumn(a, b) {
					if (a[1] === b[1]) {
						return 0;
					}
					else {
						return (a[1] < b[1]) ? -1 : 1;
					}
				}
				//console.log("data.length: "+data.length)
				for(var i=0;i<data.length;i++){
					//console.log("data[i].CODIGO: "+data[i].CODIGO);
					if(data[i].CNPJ == "undefined" || data[i].CNPJ == undefined){
						dados.push({
							'id':"",
							'text':"Cadastro não encontrado"
						})
					}else{
						var txtCNPJ = data[i].CNPJ
						var cnpjFormatado = txtCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
						
						dados.push({
							'id':data[i].CNPJ,
							'text':cnpjFormatado+" - "+data[i].NOME
						})
					}
				}
				return {
					results: dados
				};
			}
		},escapeMarkup: function (m) { return m; }
	});
	$("#razaoSocial").attr("onchange","validaEdicao(this.id,'select2'),getComplFornec(),trocaValue(id)");
}

function getComplFornec() {
	console.log("entrou getComplFornec");
	var cnpj = $("#razaoSocial").val();
	
	$("#codFornec").val("");
	$("#cnpj").val("");
	$("#loja").val("");
	$("#cep").val("");
	$("#estado").val("");
	$("#cidade").val("");
	$("#bairro").val("");
	$("#endereco").val("");
	$("#complemento").val("");
	$("#contato").val("");
	$("#emailFornec").val("");
	$("#telefoneFornec").val("");
	
	console.log("cnpj: "+cnpj);
	
	if(cnpj != "" && cnpj != undefined){
		
		$.ajax({
			type: "GET",
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			url: URL_TOTVS + '/WS_FORNECEDORES',
			data: { 
					DESCRICAO: '',
					CNPJ: cnpj,
					FILTRO: 'CNPJ'
					},
			dataType: 'json',
			contentType: "application/json",
			crossDomain: true,
			success: function (res, status, xhr) {
				
				if(res.length > 0){
					$("#codFornec").val(res[0].COD);
					$("#cnpj").val(res[0].CNPJ);
					$("#loja").val(res[0].LOJA);
					$("#cep").val(res[0].CEP);
					$("#estado").val(res[0].ESTADO);
					$("#cidade").val(res[0].MUNICIPIO);
					$("#bairro").val(res[0].BAIRRO);
					$("#endereco").val(res[0].ENDERECO);
					//$("#complemento").val(res[0].COMPLEMENTO);
					$("#contato").val(res[0].CONTATO);
					$("#emailFornec").val(res[0].EMAIL);
					$("#telefoneFornec").val( "(" +res[0].DDD+ ") " +res[0].TELEFONE);
					
				}
			}
		});
	}


}

function getComplProd() {
	console.log("entrou getComplProd");
	
	var filial = $("#filialTXT").val();
	var codProduto = $("#produtoTemp").val();
	
	$("#tipoProdutoTemp").val(""); 	
	$("#uniMedProdutoTemp").val("");	
	$("#contaContabProdTemp").val("");
	$("#itemContaProdTemp").val(""); 	
	
	if(codProduto != "" && codProduto != undefined){
		
		$.ajax({
			type: "GET",
			headers: {
				'Access-Control-Allow-Origin': '*'
			},
			url: URL_TOTVS + '/RETPROD',
			data: { 
					FILIAL: filial,
					CODIGO: codProduto,
					DESCRICAO: '',
					FILTRO: 'CODIGO'
					},
			dataType: 'json',
			contentType: "application/json",
			crossDomain: true,
			success: function (res, status, xhr) {
				
				if(res.length > 0){
					$("#tipoProdutoTemp").val(res[0].TIPO); 	
					//$("#uniMedProdutoTemp").val(res[0].UM);	
					$("#contaContabProdTemp").val(res[0].CONTA);
					$("#itemContaProdTemp").val(res[0].ITEMCC);
				}
			}
		});
	}


}

function getCondPag(){
	
	console.log("BUSCANCO CONDICOES DE PAGAMENTO");
	
	var dados = new Array();
		
	$.ajax({
		type: "GET",
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		url: URL_TOTVS+'/WS_COND_PAGAMENTO',
		data: { DESCRICAO : ""
				},
		dataType: 'json',
		contentType: "application/json",
		crossDomain:true,
		success: function(res, status, xhr){
			for(var i=0;i<res.length;i++){
				//console.log("data[i].CODIGO: "+data[i].CODIGO);
				if(res[i].CODIGO == "undefined" || res[i].CODIGO == undefined){
					dados.push({
						'id':"",
						'text':"Cadastro não encontrado"
					})
				}else{
					dados.push({
						'id':res[i].CODIGO,
						'text':res[i].DESCRICAO
					})
				}
			}	

			$("#condPagamentoCTF").select2({
				placeholder: 'Selecione a condição',
				data: dados		
			});			
		}
	});	
	
	return dados;

}

function getTipoPedido(){
	
	console.log("BUSCANCO TIPOS DE PEDIDO");
	
	var dados = new Array();
		
	$.ajax({
		type: "GET",
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		url: URL_TOTVS+'/WS_TIPO_PEDIDO',
		data: { FILIAL : ""
				},
		dataType: 'json',
		contentType: "application/json",
		crossDomain:true,
		success: function(res, status, xhr){
			for(var i=0;i<res.length;i++){
				//console.log("data[i].CODIGO: "+data[i].CODIGO);
				if(res[i].CHAVE == "undefined" || res[i].CHAVE == undefined){
					dados.push({
						'id':"",
						'text':"Cadastro não encontrado"
					})
				}else{
					dados.push({
						'id':res[i].CHAVE,
						'text':res[i].CHAVE+" - "+res[i].DESCRICAO
					})
				}
			}	

			$("#tipoPedidoCTF").select2({
				placeholder: 'Selecione o tipo',
				data: dados		
			});		
		}
	});	
	
	return dados;

}

function getDadosSC(){
	
	console.log("BUSCANCO DADOS SC");
	
	var empresaOBJ = JSON.parse($("#empresaOBJ").val());
	
	var filial = empresaOBJ[0].selecionado;
	
	//var filial = $("#filialTXT").val();
	var codigoSC = $("#numSC").val();
		
	$.ajax({
		type: "GET",
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		url:URL_TOTVS+'/WS_SOL_COMPRAS',
		data: { FILIAL : filial,
				CODIGO : codigoSC
				},
		dataType: 'json',
		contentType: "application/json",
		crossDomain:true,
		success: function(res, status, xhr){
			console.log("RES: "+res);
			
			var tbProdutos = varreTabela("tbGradeProdutos");
			
			for(var i=0;i<res.length;i++){
				for(var z=0;z<tbProdutos.length;z++){
					if($("#codProdutoSC___"+tbProdutos[z]).val() == res[i].PRODUTO){
						$("#numItemSC___"+tbProdutos[z]).val(res[i].ITEM)
					}
				}
			}
			
		}
	});	

}


function getNatureza(){
	
	$("#naturezaTemp option").remove();	
	$('#naturezaTemp').val(null).trigger('change');	
	
	if($("#filtroNaturezaTXT").val() != ""){
		var filtroNatureza = $("#filtroNaturezaTXT").val();
	}else{
		var filtroNatureza = "DESCRICAO";
	}
		
	$("#naturezaTemp").select2({
		minimumInputLength: 2,
		ajax:{
			type: "GET",
			//beforeSend: function (xhr) {
			//	xhr.setRequestHeader('Authorization', 'Basic YWxvaXNpby5sb3VyZW5jbzoxMjM0NTY=');
			//},
			url: URL_TOTVS+'/WS_NATUREZA',
			data: function (params) {
				var str = params.term
				var filtroEmp = $("#filtroNaturezaTXT").val() ;
				return {
				  DESCRICAO: str.toUpperCase(),
				  CODIGO: str.toUpperCase(),
				  FILTRO: filtroEmp
				};
			},
			dataType: 'json',
			crossDomain:true,
			processResults: function (data) {
				var dados = []
				
				data.sort(compareSecondColumn);

				function compareSecondColumn(a, b) {
					if (a[1] === b[1]) {
						return 0;
					}
					else {
						return (a[1] < b[1]) ? -1 : 1;
					}
				}
				//console.log("data.length: "+data.length)
				for(var i=0;i<data.length;i++){
					//console.log("data[i].CODIGO: "+data[i].CODIGO);
					if(data[i].CODIGO == "undefined" || data[i].CODIGO == undefined){
						dados.push({
							'id':"",
							'text':"Cadastro não encontrado"
						})
					}else{
						//var txtCODIGO = data[i].CODIGO
						//var codigoFormatado = txtCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
						
						dados.push({
							'id':data[i].CODIGO,
							'text':data[i].CODIGO+" - "+data[i].DESCRI
						})
					}
				}
				return {
					results: dados
				};
			}
		},escapeMarkup: function (m) { return m; }
	});
	$("#naturezaTemp").attr("onchange","validaEdicao(this.id,'select2')");
}

function getStatusPC(){
	console.log("entrou getStatusPC");
	var empresaSTR = $("#empresaOBJ").val();
	var empresaOBJ = JSON.parse(empresaSTR);
	var numPC = $("#numPC").val();
	
	console.log("numPC: "+numPC);
	$.ajax({
		type: "GET",
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		url: URL_TOTVS + '/WS_PEDIDO_COMPRAS',
		data: { 
				FILIAL:	empresaOBJ[0].selecionado,
				CODIGO: numPC
				},
		dataType: 'json',
		contentType: "application/json",
		crossDomain: true,
		success: function (res, status, xhr) {
			
			if(res[0].CONAPRO == "B"){
				$("#msgStatusPedidoPendente").show();
				setTimeout(function() {
					$("#msgStatusPedidoPendente").hide();
				}, 5000);
			}else if(res[0].CONAPRO == "R"){
				$("#msgStatusPedidoNegado").show();
				setTimeout(function() {
					$("#msgStatusPedidoNegado").hide();
				}, 5000);
			}else if(res[0].CONAPRO == "A"){
				$("#msgStatusPedidoAprovado").show();
				setTimeout(function() {
					$("#msgStatusPedidoAprovado").hide();
				}, 5000);
			}
			
			var tbItensPedido = varreTabela("tbItensPedido");
			
			for(var i=0;i<res.length;i++){
				console.log("res[i].FILIAL: "+res[i].FILIAL);
				
				for(var z=0;z<tbItensPedido.length;z++){
					
					if(res[i].PRODUTO == $("#codItemSolicitado___"+tbItensPedido[z]).val()){
						$("#numItem___"+tbItensPedido[z]).val(res[i].ITEM)
					}
				
				}
				
				
			}
		
			

		}
	});
	
}

function getEmpresaSC() {
	console.log("entrou getEmpresa");
	$("#empresaSC option").remove();
	$('#empresaSC').val(null).trigger('change');
	
	$("#empresaSC").select2({
		minimumInputLength: 2,
		ajax:{
			type: "GET",
			url: URL_TOTVS+'/LISTA_EMPRESAS',
			data: function (params) {
				var str = params.term
				return {
				  DESCEMPRESA: str.toUpperCase()
				};
			},
			dataType: 'json',
			crossDomain:true,
			processResults: function (data) {
				var dados = []
				
				data.sort(compareSecondColumn);

				function compareSecondColumn(a, b) {
					if (a[1] === b[1]) {
						return 0;
					}
					else {
						return (a[1] < b[1]) ? -1 : 1;
					}
				}
				//console.log("data.length: "+data.length)
				for(var i=0;i<data.length;i++){
					//console.log("data[i].CODIGO: "+data[i].CODIGO);
					if(data[i].CODEMP == "undefined" || data[i].CODEMP == undefined){
						dados.push({
							'id':"",
							'text':"Cadastro não encontrado"
						})
					}else{
						dados.push({
							'id':data[i].CODEMP,
							'text':data[i].CODEMP+" - "+data[i].NOMEEMP
						})
					}
				}
				
				/*if(data.length == 0){
						dados.push({
							'id':"",
							'text':"Cadastro não encontrado"
						})
				}*/
				
				return {
					results: dados
				};
			}
		},escapeMarkup: function (m) { return m; }
	});
	$("#empresaSC").attr("onchange","validaEdicao(this.id,'select2')");

}

function buscaPedidosSC(){
	console.log("entrou buscaPedidosSC");
	
	var numEmpTXT = $("#empresaSCTXT").val();
	var numEmp = numEmpTXT.substring(4, 0);
	var numSC = $("#numREPSC").val();
	
	var numSCEmp = numEmp+"-"+numSC;
	
	var parte1EMP = numEmp.substring(2, 0);
	var parte2EMP = numEmp.substring(4, 2);
	
	var filialTXT = parte2EMP.toString()+parte1EMP.toString();
	
	var c0 = DatasetFactory.createConstraint("numSCEmp", numSCEmp, numSCEmp, ConstraintType.MUST);
	var c1 = DatasetFactory.createConstraint("filialTXT", filialTXT, filialTXT, ConstraintType.MUST);
	var dataset = DatasetFactory.getDataset("dsConsultaPedidosSC", null, new Array(c0,c1), null);
	
	var tbPedidosSC = varreTabela("tbPedidosSC");
	for(var i=0;i<tbPedidosSC.length;i++){
		var elemento = $("#excludetbPedidosSC___"+tbPedidosSC[i]).parent().parent();
		$(elemento).remove();
	}	
	
	for(var i=0;i<dataset.values.length;i++){
		var row = dataset.values[i];
		
		var linha = wdkAddChild("tbPedidosSC");
	
		$("#codEmpPedidoSC___"+linha).val(numEmp);
		$("#cnpjPedidoSC___"+linha).val(row["cnpjPED"]);
		$("#fluigPedidoSC___"+linha).val(row["numSolicitacao"]);
		$("#numPedidoSC___"+linha).val(row["numPedido"]);
		$("#razaoPCSC___"+linha).val(row["razaoSocialPED"]);
	}
	
	var tbPedidosSC = varreTabela("tbPedidosSC");

	console.log("tbPedidosSC.length: "+tbPedidosSC.length);
	
	for(var i=0;i<tbPedidosSC.length;i++){
		var numPC = $("#numPedidoSC___"+tbPedidosSC[i]).val();
		verificaStatusPEDSC(numEmp,numPC,tbPedidosSC[i]);
	}
}

function verificaStatusPEDSC(codEmp,numPC,numLinha){
	
	console.log("entrou verificaStatusPEDSC");

	console.log("codEmp: "+codEmp);
	console.log("numPC: "+numPC);
	console.log("numLinha: "+numLinha);
	
	$.ajax({
		type: "GET",
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		url: URL_TOTVS + '/WS_PEDIDO_COMPRAS',
		async: false,
		data: { 
				FILIAL:	codEmp,
				CODIGO: numPC
				},
		dataType: 'json',
		contentType: "application/json",
		crossDomain: true,
		success: function (res, status, xhr) {
			
			if(res[0].CONAPRO == "B"){
				$("#statusPCSC___"+numLinha).val("PENDENTE");
				var elemento = $("#acoestbPedidosSC___"+numLinha).prev();
				
				var dados = "<div class='btn-group'>" +
								"<button type='button' class='btn btn-info' onclick='carregaDadosREP("+numLinha+")' id='btncarregaDadosPCSC___" + numLinha+"' >Reprocessar</button>"+
							"</div>";
				
				$(elemento).html("");
				$(elemento).append(dados);
			}else if(res[0].CONAPRO == "L"){
				$("#statusPCSC___"+numLinha).val("APROVADO");
				var elemento = $("#acoestbPedidosSC___"+numLinha).prev();
				
				var dados = "<div class='btn-group'>" +
								"<button type='button' class='btn btn-info' onclick='carregaDadosREP("+numLinha+")' id='btncarregaDadosPCSC___" + numLinha+"' >Reprocessar</button>"+
							"</div>";
				
				$(elemento).html("");
				$(elemento).append(dados);
			}else if(res[0].CONAPRO == "R"){
				$("#statusPCSC___"+numLinha).val("REJEITADO");
				
				var elemento = $("#acoestbPedidosSC___"+numLinha).prev();
				
				var dados = "<div class='btn-group'>" +
								"<button type='button' class='btn btn-info' onclick='carregaDadosREP("+numLinha+")' id='btncarregaDadosPCSC___" + numLinha+"' >Reprocessar</button>"+
							"</div>";
				
				$(elemento).html("");
				$(elemento).append(dados);
			}

		}
	});
	
	
}

function carregaDadosREP(numLinha){
	
	var codEmp = $("#codEmpPedidoSC___"+numLinha).val();
	var numPC = $("#numPedidoSC___"+numLinha).val();
	var cnpjPEDSC = $("#cnpjPedidoSC___"+numLinha).val();
	var fluigPedidoSC = $("#fluigPedidoSC___"+numLinha).val();
	
	var linhaCotacaoOriginal = "NULL";
	
	$.ajax({
		type: "GET",
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		url: URL_TOTVS + '/WS_PEDIDO_COMPRAS',
		async: false,
		data: { 
				FILIAL:	codEmp,
				CODIGO: numPC
				},
		dataType: 'json',
		contentType: "application/json",
		crossDomain: true,
		success: function (res, status, xhr) {
			
			var itens = res[0].ITENS;
			
			for(var i=0;i<itens.length;i++){
				var linha = wdkAddChild("tbItensPedido");
				
				var c0 = DatasetFactory.createConstraint('cnpj', cnpjPEDSC, cnpjPEDSC, ConstraintType.MUST);
				var c1 = DatasetFactory.createConstraint('fluigCotacao', fluigPedidoSC, fluigPedidoSC, ConstraintType.MUST);
				var c2 = DatasetFactory.createConstraint('linhaCotacaoOriginal', linhaCotacaoOriginal, linhaCotacaoOriginal, ConstraintType.MUST);
				var c3 = DatasetFactory.createConstraint('cotacaoFinal', "SIM", "SIM", ConstraintType.MUST);
				var c4 = DatasetFactory.createConstraint('codProduto', itens[i].PRODUTO, itens[i].PRODUTO, ConstraintType.MUST);
				var colunas = new Array('qtdItens','documentid','version','numItem','numLinhaItemCotacao','codItemSolicitado','descItemSolicitado','qtdSolicitada','itemDisponibilizado','qtdDisponibilizada','valUnitario','freteItem','descontoItem','icmsItem','ipiItem','pisItem','cofinsItem','totalItem','optPossuiItem','itemCotacaoFinal','numFluigItemCotacao','infoComplItemSC','infoComplItemFornec','cnpjFornecCotacao','linhaCotacaoOriginal','issItem','inssItem','irItem','csllItem','outroImpostoVlr','outroImpostoDesc','UnidMedidaProd','UnidMedidaProdOBJ','obsItemSC','codCentroCusto','descCentroCusto');
				
				var dataset = DatasetFactory.getDataset('dsBuscaItemCotacao', colunas, new Array(c0, c1, c2, c3, c4), null);
				
				var row = dataset.values[0];

				$("#codItemSolicitado___"+linha).val( itens[i].PRODUTO );
				$("#descItemSolicitado___"+linha).val( itens[i].DESCRI );
				$("#qtdItem___"+linha).val( itens[i].QUANT );
				$("#codCentroCusto___"+linha).val( row["codCentroCusto"] );
				$("#centroCusto___"+linha).val( row["descCentroCusto"] );
				$("#codNaturezaProd___"+linha).val(  );
				$("#naturezaProd___"+linha).val(  );
				$("#infoComplItem___"+linha).val( row["infoComplItemSC"] );
				$("#obsItem___"+linha).val( row["obsItemSC"] );
				
				var precoUnitario = parseFloat(itens[i].PRECO);
				var precoUnitarioFormatado = precoUnitario.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
				
				$("#tipoProd___"+linha).val(  );
				$("#uniMedProduto___"+linha).val( row["UnidMedidaProd"] );
				$("#uniMedProdutoOBJ___"+linha).val( row["UnidMedidaProdOBJ"] );
				$("#contaContabProd___"+linha).val( itens[i].CONTA );
				$("#itemContaProd___"+linha).val( itens[i].ITEMCTA );
				$("#valUnitario___"+linha).val( precoUnitarioFormatado );
				$("#totalItem___"+linha).val(  );
				$("#totalBrutoItem___"+linha).val(  );
				
				$("#totalBrutoItem___"+linha).val(  );
				
				$("#aliqIPI___"+linha).val(  );
				$("#valIPI___"+linha).val(  );
				
				limpaTbProdutoSCTemp();
				btnTbProdutosTempSC();
				
			//	posicionaPainel("#pontoTbPedidos");
			}
			
			

		}
	});
	
}

function getUnidadeMedida(){
	
	console.log("BUSCANDO UNIDADE DE MEDIDA");
	
	var dados = new Array();
		
	$.ajax({
		type: "GET",
		headers: {
			'Access-Control-Allow-Origin': '*'
		},
		url: URL_TOTVS+'/WS_UNIDADE_MEDIDA',
		data: { FILIAL : ""
				},
		dataType: 'json',
		contentType: "application/json",
		crossDomain:true,
		success: function(res, status, xhr){
			for(var i=0;i<res.length;i++){
				//console.log("data[i].CODIGO: "+data[i].CODIGO);
				if(res[i].UNIMED == "undefined" || res[i].UNIMED == undefined){
					dados.push({
						'id':"",
						'text':"Cadastro não encontrado"
					})
				}else{
					dados.push({
						'id':res[i].UNIMED,
						'text':res[i].UNIMED+" - "+res[i].DESCRICAO
					})
				}
			}			
		}
	});	
	
	return dados;

}

