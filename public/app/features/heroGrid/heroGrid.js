angular.module("WalrusPunch").controller("heroGridController", [
	"$scope",
	"heroService",
	"counterPickerPageService",
	"translationService",
	"responsiveService",
	"guidService",
	"analyticsService",
	"heroFilterService",
	"TRANSLATION_EVENTS",
	function($scope, heroService, counterPickerPageService, translationService, responsiveService, guidService, analyticsService, heroFilterService, TRANSLATION_EVENTS){
		var mixItUpFilterTimeout = undefined;

		$scope.heroGridId = "hero-grid-"+guidService.newGuid();
		$scope.translationService = translationService;
		$scope.heroes = heroService.getTranslatedHeroes();

		var translatedHeroesWatcher = $scope.$watch(heroService.getTranslatedHeroes, function(translatedHeroes){
			if($scope.heroes.length === 0){
				$scope.heroes = translatedHeroes;
				return;
			}
			$scope.heroes.forEach(function(hero){
				var matchingHero = translatedHeroes.find(function(translatedHero){
					return translatedHero.id === hero.id;
				});
				if(matchingHero === undefined){
					return;
				}

				heroService.retranslateHero(hero, matchingHero);
			});
		}, true);

		var searchKeyWordsWatcher = $scope.$watch(counterPickerPageService.getSearchKeyWords, function(search){
			debounceFilterMixItUp(search);
			filterMixItUp(search);
		});

		var enemyTeamWatcher = $scope.$watch(counterPickerPageService.getEnemyTeam, function(enemyTeam){
			$scope.heroes.forEach(function(hero){
				hero.isSelected = enemyTeam.any(function(enemy){
					return enemy.id === hero.id;
				});
			});
		}, true);

		$scope.$on("$destroy", function(){
			translatedHeroesWatcher();
			searchKeyWordsWatcher();
			enemyTeamWatcher();
		});

		$scope.$on(TRANSLATION_EVENTS.translationChanged, function(){
			setTimeout(function(){
				var heroGrid = $("#"+$scope.heroGridId);
				heroGrid.mixItUp("sort", "name: desc");
			},0);
		});

		$scope.getHeroImage = responsiveService.getHeroImageLarge;

		$scope.onHeroClicked = function(hero){
			counterPickerPageService.addEnemyHero(hero);
			analyticsService.trackEvent("Hero Clicked", hero.name);
		};

		$scope.isHeroSelected = function(hero){
			var enemyTeam = counterPickerPageService.getEnemyTeam();
			return enemyTeam.any(function(enemyHero){
				return enemyHero.id === hero.id;
			});
		};


		function filterMixItUp(searchText){
			var heroGrid = $("#"+$scope.heroGridId);
			var filter = heroGrid.find(".mix").filter(function () {
				var heroId = $(this).attr("data-hero-id");
				return heroFilterService.filterHeroBySearchText($scope.heroes, searchText, heroId);
			});
			heroGrid.mixItUp("filter", filter, function(){ heroFilterService.addHeroIfOneLeft($scope.heroes); });
		}

		function initializeMixItUp(){
			var heroGrid = $("#"+$scope.heroGridId);
			heroGrid.mixItUp({
				controls: {
					enable: false
				}
			});
			heroGrid.mixItUp("sort", "name: desc");
		}


		function debounceFilterMixItUp(search){
			if(mixItUpFilterTimeout !== undefined){
				clearTimeout(mixItUpFilterTimeout);
			}
			mixItUpFilterTimeout = setTimeout(function(){
				clearTimeout(mixItUpFilterTimeout);
				mixItUpFilterTimeout = undefined;
				filterMixItUp(search);
			}, 500);
		}


		setTimeout(function(){
			initializeMixItUp();
		}, 0);
	}
]);