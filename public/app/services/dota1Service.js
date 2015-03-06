angular.module("WalrusPunch").service("dota1Service", ["$localStorage", function($localStorage){
	var dota1ModeOn = false;


	function Dota1Service(){
		loadLocalStorage();
		$(document).ready(function(){
			updateBodyCss();
		});
	}

	Dota1Service.prototype.isInDota1Mode = function(){
		return dota1ModeOn;
	};

	Dota1Service.prototype.setDota1Mode = function(on){
		dota1ModeOn = on;
		updateLocalStorage();
		updateBodyCss();
	};


	function updateBodyCss(){
		if(dota1ModeOn){
			$("body").addClass("dota1");
			return;
		}
		$("body").removeClass("dota1");
	}

	function updateLocalStorage(){
		$localStorage.dota1Mode = dota1ModeOn;
	}

	function loadLocalStorage(){
		dota1ModeOn = !!$localStorage.dota1Mode;
	}

	return new Dota1Service();
}]);