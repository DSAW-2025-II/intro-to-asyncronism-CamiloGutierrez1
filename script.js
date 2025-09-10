//Strcture of the Pokedex ,Defining the class that encapsulates the logic of the Pokedex application
class Pokedex{
    constructor(){ // Constructor method with variables for the state of the app
        this.currentOffset = 0;
        this.limit = ENV.LIMIT;
        this.allPokemon= [];
        this.filteredPokemon =[];
        this.selectedPokemon = null;
        this.isLoading = false;
        this.apiUrl = ENV.API_URL;
        this.maxPokemon = ENV.MAX_POKEMON;

        this.init();//Method to initialize


    }
    //Method to the main initialization
    async init(){
        console.log("Initializing Pokedex...");

        const testPokemon = await this.fetchPokemon(1);//Fetch a test pokemon to check if the api is working
        if(testPokemon){
            console.log("Fetch test successful! Name:", testPokemon.name);
            console.log("ID:", testPokemon.id);
            console.log("Image URL:", testPokemon.sprites.front_default); 
        }

        //Message to show that the app is working
        this.showTestMessage();
    }

    async fetchPokemon(pokemonId){
        try{
            console.log(`Fetching data for Pokemon ID:", ${pokemonId} `); // Substitutes the variable for the actual id
            const responde = await fetch(`${this.apiUrl}pokemon/${pokemonId}`); // Fetch the data from the API
            if(!responde.ok){
                throw new Error(`HTTP error! status: ${responde.status}`);
            }
            const pokemonData = await responde.json(); // Parse the response as JSON
            console.log("Pokemon data received:", pokemonData);

            return pokemonData; // Return the fetched data

        }catch(error){
            console.error("Error fetching pokemon data:", error);
            return null;
        }
    }

    /*Test window to show that the app is working,
    also show the current state of the variables on pokemonGrid*/
    showTestMessage(){
        const grid = document.getElementById("pokemonGrid"); //Grid of the pokemons list
        grid.innerHTML =` 
            <div class ="loading">
                <h3>Basic structure load</h3>
                <p>The pokedex class has been initialized correctly</p>
                <p><strong>Current state: </strong></p>
                <ul style="text-align: left; margin: 1rem 0;">
                    <li>Offset: ${this.currentOffset}</li>
                    <li>Limit: ${this.limit}</li>
                    <li>Loaded Pokemons: ${this.allPokemons.length}</li>
                    <li>Filtered Pokemons: ${this.filteredPokemon.length}</li>
                </ul>
                <p><strong></strong></p>    
        </div>`;
    }


}