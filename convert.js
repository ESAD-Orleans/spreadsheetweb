jQuery(document).ready(function($){

	var template = _.template($('#template').html()),
		tagsRegEx = /(\[image:([a-zA-Z0-9-_\\\/.])+\])|(\[(class|id):([a-zA-Z0-9-_ ]+)\])|(\[width:([0-9]+)\])/g,
		tagFormat = /(\[([a-z]+):(.*)\])/;

	function Convert(rawString){

		var spreadsheet = {
			initialize:function(){
				// initialize rows
				var rows = _([]);
				var cols = _([]);
				_(Papa.parse(rawString).data,{skipEmptyLines:true}).each(function(row){
					var notEmpty = false,
						_row = _([]);
					_(row).each(function(cell,i){
						if(cols[i]==undefined){
							cols[i] = {empty:true};
						}
						var emptyCell = cell == "";
						if(!emptyCell){
							cols[i].empty = false;
						}
						// test if empty cell
						notEmpty |= !emptyCell;
						if(!notEmpty) return;


						var tags;
						var _cell = _(cell);
						_cell.tags = _([]);

						// format tags display
						_cell.format = function(k){
							var value = _cell.tags[k];
							if(value==undefined){
								value = "";
							}else{
								switch (k) {
									case "class":
										return "class='"+value+"'";
									break;
									case "width":
										return "style='width:"+value+"px;'";
								}
							}
							return value;
						};

						// parse tags
						tags = cell.match(tagsRegEx);
						if(tags){
							_(tags).each(function(pattern){
								var tag = pattern.match(tagFormat),
									tagName = tag[2],
									tagValue = tag[3],
									tagIndex = _cell._wrapped.indexOf(pattern);
								_cell.tags[tagName] = tagValue;
								switch (tagName) {
									case 'image':
										_cell._wrapped = cell.substr(0, tagIndex) + '<img src="' + tagValue + '" />' + cell.substr(tagIndex+pattern.length);
										break;
									default :
										_cell._wrapped = cell.substr(0, tagIndex) + cell.substr(tagIndex + pattern.length);
										break;
								}
							});
						}
						// push wrapped cell to wrapped row
						_row.push(_cell);
					});
					if(notEmpty){
						rows.push(_row);
					}
				});
				this.rows = rows;
				this.cols = cols;
				console.log(cols);
			}
		};

		spreadsheet.initialize();

		$('#main').html(template(spreadsheet));
	}

	var fileName = $('#template').data('file');
	$.ajax({url: fileName}).done(Convert);
});