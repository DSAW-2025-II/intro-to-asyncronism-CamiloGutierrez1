    //Pokemon main structure
    class Pokedex{
        constructor(){ //Constructor of the class with the variables
            this.currentOffset = 0;
            this.limit = ENV.LIMIT;
            this.allPokemon= [];
            this.filteredPokemon =[];
            this.selectedPokemon = null;
            this.isLoading = false;
            
            this.apiUrl = ENV.API_URL;
            this.maxPokemon = ENV.MAX_POKEMON;
            this.currentSearch = ENV.CURRENT_SEARCH;
            this.currentTypeFilter = ENV.CURRENT_TYPE_FILTER;
            this.currentRangeFrom = ENV.CURRENT_RANGE_FROM;
            this.currentRangeTo = ENV.CURRENT_RANGE_TO;

            this.init();
        
        }     
        async init(){
            await this.loadInitialPokemons(); 
            this.displayPokemonCards(); 
            this.setupClickEvents(); 
            this.setupScroll();
            this.setupSearchEvents(); 
            this.setupFilterEvents(); 
        }

        // Method to fetch the pokemons from the API ,(endpoint 1 )
        async fetchPokemon(pokemonId){
            try{
                const response=await fetch(`${this.apiUrl}pokemon/${pokemonId}`);
                if(!response.ok){
                    throw new Error(`HTTP error: ${response.status}` );
                }
                const pokemonData =await response.json() ;//parse the response as json
                return pokemonData;

            }catch(error){
                console.error("Error fetching pokemon", error);
                return null;
            }
        }
        async fetchPokemonSpecies(pokemonId){//Method to fetch pokemon species from the API, endpoint 2
            try{
                console.log(`Fetching species data for Pokemon ID: ${pokemonId}`);
                const response = await fetch(`${this.apiUrl}pokemon-species/${pokemonId}`);
                if(!response.ok){
                    throw new Error(` HTTP error :${response.status}`  );
                }
                const speciesData = await response.json();
                console.log("Pokemon species received:", speciesData );
                return speciesData;
            }catch(error){
                console.error("Error fetching pokemon species: ",error  );
                return null;
            }
        }
        async fetchPokemonByType(type){//Method to fetch pokemons by type from the API (endpoint 3) 
            try{
                console.log(`Pokemons of type: ${type }` );
                const res = await fetch(` ${this.apiUrl}type/${ type}`);
                if(!res.ok){
                    throw new Error(` HTTP error, status: ${res.status}`) ;
                }
                const typeData = await res.json();
                return typeData.pokemon.map(p => p.pokemon); // Return the list of pokemons of this type
            }catch(error){
                console.error("Error fetching pokemons by type:", error);
                return [];
            }        
        }   
     
        //Method to obtain the initial list of pokemons from the API
        async fetchPokemonList(offset= 0, limit=25){    
            try{
                console.log(`List offset=${offset},limit=${limit}`);
                const resp = await fetch(`${this.apiUrl}pokemon?offset=${offset}&limit=${limit}`)
                //revisar 
                if(!resp.ok){
                    throw new Error(`HTTP error  ${resp.status}`);
                }
                
                const data = await resp.json();
                return data.results; // Return the list of pokemons
            
            }catch(error){
                console.error("Error fetching list:", error );
                return [];
            }

        }

        async loadInitialPokemons(){//Method to load the initial list of pokemons
            this.isLoading = true;

            for (let i = 1 ; i <=25 ;  i++){
                console.log(`Loading pokemon ID: ${i}`);

                const Data = await this.fetchPokemon(i);
                if(Data){
                    this.allPokemon.push(Data);
                    console.log(`Loaded: ${Data.name} (#${Data.id})`);
                }
            }
            // Update for the next batch
            this.currentOffset= 25;
            this.filteredPokemon= [...this.allPokemon] ;
            this.isLoading =false;

            console.log(` done, total loaded ",  ${this.allPokemon.length}`);
        }

        async loadMorePokemons(){//method to infitinite scroll 
            if (this.isLoading ||this.currentOffset >= this.maxPokemon){
                return; // prevenir cargas multiples
            }
            console.log("Loading more");
            this.isLoading = true;
            this.showLoadingIndicator();

            const nextBatch =this.currentOffset + 1 ;
            const endBatch= Math.min( nextBatch +this.limit -1 ,this.maxPokemon);

            for (let i=nextBatch; i <=endBatch;i++){
                console.log("Loading  ",i); 
                const pokemonData = await this.fetchPokemon(i);
                if(pokemonData){
                    this.allPokemon.push(pokemonData);
                    console.log(`ok: ${pokemonData.name} (#${pokemonData.id})`);
                }
            }
            
            
            this.currentOffset =endBatch;
            
            this.filteredPokemon= [...this.allPokemon];
            
            this.isLoading =false;

            this.removeLoadingIndicator();
            
            this.displayPokemonCards();//  update with new pokemons

            console.log("done , total = ",this.allPokemon.length);
        }

        setupScroll(){//scroll event for infinite scrolling
            let scrollWorking= true;
            window.addEventListener("scroll", () => {
                const {scrollTop, scrollHeight, clientHeight}= document.documentElement;

                if(scrollTop +clientHeight >=scrollHeight -100){
                    this.loadMorePokemons();
                }
            });
            console.log("Sscroll configured ");
        }

        setupSearchEvents(){
            const searchInput =document.getElementById("searchInput");
            const searchBtn= document.getElementById ("searchBtn");
 
            searchInput.addEventListener("input", (event) => {
                this.currentSearch = event.target.value.trim().toLowerCase();
                console.log("Seach:", this.currentSearch);
                this.applyCurrentFilters();
            });
            searchBtn.addEventListener("click", () => {// button clicked
                this.currentSearch= searchInput.value.trim().toLowerCase();
                console.log("button , term= ", this.currentSearch);
                this.applyCurrentFilters();
            });
            searchInput.addEventListener("keypress",(event) =>{
                if(event.key === "Enter"){
                    this.currentSearch = searchInput.value.trim().toLowerCase();
                    console.log("enter pressed, term:", this.currentSearch);
                    this.applyCurrentFilters(); 
                }
            });
            console.log("search okand configured");
        }
        setupFilterEvents(){
            const typeFilter = document.getElementById("typeFilter");
            const rangeFrom = document.getElementById("rangeFrom");
            const rangeTo = document.getElementById("rangeTo");
            const applyRangeBtn = document.getElementById("applyRangeBtn");
            const clearFiltersBtn = document.getElementById("clearFiltersBtn");
            const sortOrder = document.getElementById("sortOrder");

            typeFilter.addEventListener("change", (event) => {
                this.currentTypeFilter = event.target.value;
                console.log("type filter ", this.currentTypeFilter);
                this.applyCurrentFilters();
            });
            applyRangeBtn.addEventListener("click", () => {
                const fromVal = parseInt(rangeFrom.value)|| 1 ;
                const toVal = parseInt(rangeTo.value)   || this.maxPokemon;

                this.currentRangeFrom= Math.max(1,fromVal);
                this.currentRangeTo = Math.min ( this.maxPokemon, toVal );

                if(this.currentRangeFrom > this.currentRangeTo){
                    [this.currentRangeFrom, this.currentRangeTo] = [this.currentRangeTo, this.currentRangeFrom];
                }
                console.log(`range: ${this.currentRangeFrom} "- "${this.currentRangeTo}`);
                this.applyCurrentFilters();
        
            });
             clearFiltersBtn.addEventListener("click", () => {
                this.clearAllFilters() ; //reset filtres
            });
            
            sortOrder.addEventListener("change", (event) => {
                this.sortPokemon(event.target.value);
            } );

        }
        applyCurrentFilters(){//apply all filters search, type, range
            
            let filtered = [...this.allPokemon];
            if(this.currentSearch !== ""){
                filtered = filtered.filter(pokemon => {
                    const nameMatch = pokemon.name.toLowerCase().includes(this.currentSearch);
                    const idMatch = pokemon.id.toString().includes(this.currentSearch);

                    return nameMatch || idMatch;
                }) ;
            }
            if(this.currentTypeFilter!==    ""){
                filtered =filtered.filter(pokemon => {
                    return pokemon.types.some(typeInfo => 
                    typeInfo.type.name === this.currentTypeFilter);
                }); 
            }

            filtered = filtered.filter(pokemon => {
                return pokemon.id >=this.currentRangeFrom && pokemon.id<= this.currentRangeTo ;
            });
            this.filteredPokemon = filtered;
            console.log("filtered" ,this.filteredPokemon.length,"/",this.allPokemon.length);
            this.displayPokemonCards();
            this.showSearchResults();
        }

        sortPokemon(order){//Sort the pokemons by id
            if(order === "desc"){
                this.filteredPokemon.sort((a,b) => b.id - a.id);// mayor a menor id

            }else{
                this.filteredPokemon.sort((a,b) => a.id - b.id);// menor a mayor id
            }
            this.displayPokemonCards();    
        }

        clearAllFilters(){// Clear filters and reset values
            const searchInput = document.getElementById("searchInput");
            const typeFilter = document.getElementById("typeFilter");
            const rangeFrom = document.getElementById("rangeFrom");
            const rangeTo = document.getElementById("rangeTo");
            const sortOrder = document.getElementById("sortOrder");

            // reset values
            searchInput.value = "";
            typeFilter.value = "";
            rangeFrom.value = "";
            rangeTo.value = "";
            sortOrder.value = "asc";

            // Reset intern state
            this.currentSearch = "";
            this.currentTypeFilter = "";
            this.currentRangeFrom = 1;
            this.currentRangeTo = this.maxPokemon;

            this.applyCurrentFilters();
            console.log("filters cleared");
        }


        showSearchResults(){//Method to show the search results or  without results
            const grid = document.getElementById("pokemonGrid");

            if (this.filteredPokemon.length === 0 && (this.currentSearch !== "" 
                || this.currentTypeFilter !== "")){

                grid.innerHTML = `
                    <div class = "no-results">
                       <h3>No pokemon found</h3>
                       <p>No Pokémon match your current filters</p>
                       <p>Try adjusting your search criteria or clear the filters</p>
                    </div>
                `;
                console.log("No pokemon found matching current filters");
            }else if (this.filteredPokemon.length > 0 && 
                (this.currentSearch !== ""|| this.currentTypeFilter !== "")){
                console.log(`results:  ${this.filteredPokemon.length} pokemon matching current filters`);
            }
        
        
        }

        clearSearch(){// clear the search
            const searchInput = document.getElementById("searchInput");
            searchInput.value = "";
            this.currentSearch = "";
            this.applyCurrentFilters();        
        }
        showLoadingIndicator(){//show the loading indicator
            this.removeLoadingIndicator(); //evitar duplicados           
            
            const container = document.querySelector(".container");
            const loadingDiv = document.createElement("div");//  grid of the pokemons list
            loadingDiv.id= "loadingMore";
            loadingDiv.className = "loading-more";
            loadingDiv.innerHTML= `
                <div class = "loading">
                    <p>Loading more pokemons </p>
                </div>
            `;
            container.appendChild(loadingDiv);// append the loading indicator to the container    
        }
        removeLoadingIndicator(){
            const loadingIndicator = document.getElementById("loadingMore");
            if(loadingIndicator){
                loadingIndicator.remove();
            }
        
        
        }
        displayPokemonCards(){  //Method to display the pokemon cards on the screen
            
            let contador = 0;
            const grid=document.getElementById("pokemonGrid");//Grid of the pokemons list
            grid.innerHTML=  ""; //Clear the grid before displaying
            
            this.filteredPokemon.forEach(pokemon => {

                //Tags by type
                let typesHTML = "";
                pokemon.types.forEach(typeInfo => {
                    const typeName = typeInfo.type.name;
                    typesHTML += `<span class="type-badge type-${typeName}">${typeName}</span>`;
                });
                const cardHTML = `
                    <div class="pokemon-card" data-id="${pokemon.id}">
                        <div class = "pokemon-header">
                            <div class = "pokemon-id">#${pokemon.id}</div>
                        </div>
                        <div class="pokemon-image">
                            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                        </div>    
                        <h3 class = "pokemon-name">${pokemon.name}</h3>
                        <div class="pokemon-types">
                            ${typesHTML}                 
                        </div>
                        <div class = "pokemon-basic-info">
                            <p><strong>Height:</strong> ${pokemon.height / 10} m</p>
                            <p><strong>Weight:</strong> ${pokemon.weight / 10} kg</p>
                        </div>
                    </div>
                `;
                grid.innerHTML += cardHTML;//Append each card to the grid


            });
            console.log(`display: ${this.filteredPokemon.length}Pokemones`);
        }

        setupClickEvents(){  //method to configure click events on the pokemon cards
            console.log ("Setting up click events for pokemon cards..");

            const grid = document.getElementById("pokemonGrid");

            //Add event of click at the grid
            grid.addEventListener("click", (event) => {
                
                const card = event.target.closest(".pokemon-card");//Check if a pokemon card was clicked
                if(card){
                    const pokemonId = parseInt(card.dataset.id);
                    console.log("selected card ", pokemonId);
                    this.showPokemonDetail(pokemonId);
                }
            });
            console.log("Click events configured :)" );

        }
        async showPokemonDetail(pokemonId){//Method to show the details of a selected pokemon

            //Search the pokemon in the allPokemon array
            const pokemon = this.allPokemon.find(p => p.id === pokemonId);

            if(!pokemon ){
                console.error( " Pokemon not found");
                return;
            }
            // obtain extra data from specie endpoint
            const speciesData = await this.fetchPokemonSpecies(pokemonId);
            
            this.selectedPokemon= pokemon;//Save the selected pokemon

            const detailContainer = document.getElementById( "pokemonDetail");//Obtain the detail container

            let typesHTML = "";
            // Array and Loop to create types 1 by 1
            for (let i = 0; i < pokemon.types.length; i++){
                const typeName = pokemon.types[i].type.name;
                typesHTML += `<span class ="type-badge type-${typeName}">${typeName}</span>`;
            }
            //Array to create abilities 1 by 1
            let abilitiesHTML = "";
            for (let i = 0; i < pokemon.abilities.length; i++){
                const abilityName = pokemon.abilities[i].ability.name;
                abilitiesHTML += `<span class ="ability-badge">${abilityName}</span>`;
            }

            let statsHTML = "";
            //stats 1 by 1
            pokemon.stats.forEach(statInfo => {
                statsHTML += `
                    <div class="stat-item">
                        <span class="stat-name">${statInfo.stat.name}</span>
                        <span class="stat-value">${statInfo.base_stat}</span>
                    </div> 
                `;
            });

            let description = "No description available.";// description of the pokemon
            if(speciesData && speciesData.flavor_text_entries){
                const englishEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === "en");
                if(englishEntry){
                    description = englishEntry.flavor_text.replace(/\f/g, " ");
                }
            }

            let category = "Unknown"; // category of the pokemon
            if(speciesData && speciesData.genera){
                const englishGenus = speciesData.genera.find(genus => genus.language.name === "en");
                if(englishGenus){
                    category = englishGenus.genus;
                }    
            }

            // Detail HTML structure
            // Insert variables in a string template.
            const detailHTML = `
            <div class="pokemon-detail-content">
                <div class="detail-image">
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                </div>
                
                <h2 class="detail-name">${pokemon.name}</h2>
                <p class="detail-id">#${pokemon.id}</p>
                <p class="detail-category">${category}</p>
                
                <div class="detail-section">
                    <h4>Description</h4>
                    <p class="pokemon-description">${description}</p>
                </div>

                <div class="detail-section">
                    <h4>Basic Information</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-name">Height</span>
                            <span class="stat-value">${pokemon.height/ 10} m</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-name">Weight</span>
                            <span class="stat-value">${pokemon.weight/ 10 } kg</span>
                        </div>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Types</h4>
                    <div class="types-list">
                        ${typesHTML}
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Abilities</h4>
                    <div class="abilities-list">
                        ${abilitiesHTML}
                    </div>
                </div>

                <div class="detail-section">
                    <h4>Base Stats</h4>
                    <div class="stats-grid">
                        ${statsHTML}
                    </div>
                </div>
            </div>
        `;

        detailContainer.innerHTML = detailHTML;// Insert the detail HTML into the container
        console.log(`Detail shown for: ${pokemon.name}`);
            
            
        
        }       
    }
    
    document.addEventListener("DOMContentLoaded", () => {
        const pokedex = new Pokedex(); //Create an instance of the Pokedex class when the DOM is loaded
    });