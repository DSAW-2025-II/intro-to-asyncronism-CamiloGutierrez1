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

        /*const testPokemon = await this.fetchPokemon(1); Fetch a test pokemon to check if the api is working
        if(testPokemon){
            console.log("Fetch test successful! Name:", testPokemon.name);
            console.log("ID:", testPokemon.id);
            console.log("Image URL:", testPokemon.sprites.front_default); 
        }*/

        await this.loadInitialPokemons(); //Load the initial list of pokemon
        
        //Message to show that the app is working
        this.showTestMessage();
    }

    //Method to fetch pokemon data from the API
    async fetchPokemon(pokemonId){
        try{
            console.log(`Fetching data for Pokemon ID:", ${pokemonId} `); // Substitutes the variable for the actual id
            const response = await fetch(`${this.apiUrl}pokemon/${pokemonId}`); // Fetch the data from the API
            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const pokemonData = await response.json(); // Parse the response as JSON
            console.log("Pokemon data received:", pokemonData);

            return pokemonData; // Return the fetched data

        }catch(error){
            console.error("Error fetching pokemon data:", error);
            return null;
        }
    }

    //Method to obtain the initial list of pokemons from the API
    async fetchPokemonList(offset= 0, limit=25){
        try{
            console.log(`Fetching pokemon list: offset=${offset}, limit=${limit}`);
            
            const response = await fetch(`${this.apiUrl}pokemon?offset=${offset}&limit=${limit}`);

            if(!response.ok){
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log("Pokemon list received:", data);
            return data.results; // Return the list of pokemons
            
        }catch(error){
            console.error("Error fetching pokemon list:", error);
            return [];
        }

    }

    async loadInitialPokemons(){
        console.log("Loading initial pokemons...");

        this.isLoading = true;
        
        console.log("Loading pokemon from 1 to 25..");


        for (let i = 1; i <= 25; i++){
            console.log(`Loading pokemon ID: ${i}`);

            const pokemonData = await this.fetchPokemon(i);
            if(pokemonData){
                this.allPokemon.push(pokemonData);
                console.log(`Loaded: ${pokemonData.name} (#${pokemonData.id})`);
            }
        }
        // Update for the next batch
        this.currentOffset = 25;
        this.filteredPokemon = [...this.allPokemon];
        this.isLoading = false;

        console.log(` Load complete! Total pokemon loaded: ",  ${this.allPokemon.length}`);
    }


    /*Test window to show that the app is working,
    also show the current state of the variables on pokemonGrid*/
    showTestMessage(){
        const grid = document.getElementById("pokemonGrid"); //Grid of the pokemons list
        grid.innerHTML =` 
            <div class ="loading">
                <h3>Pokemon List Loading</h3>
                <p>The pokedex class has been initialized correctly</p>
                <p><strong>Current state: </strong></p>
                <ul style="text-align: left; margin: 1rem 0;">
                    <li>Offset: ${this.currentOffset}</li>
                    <li>Limit: ${this.limit}</li>
                    <li>Loaded Pokemons: ${this.allPokemon.length}</li>
                    <li>Filtered Pokemons: ${this.filteredPokemon.length}</li>
                    <li>Is Loading: ${this.isLoading}</li>
                </ul>
                <p><strong>The loading process!</strong></p>
                ${this.allPokemon.length > 0 ? `
                    <p><strong>First Pokemon loaded:</strong> ${this.allPokemon[0].name} (#${this.allPokemon[0].id})</p>
                    <p><strong>Last Pokemon loaded:</strong> ${this.allPokemon[this.allPokemon.length-1].name} (#${this.allPokemon[this.allPokemon.length-1].id})</p>
                ` : ''}   
        </div>`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const pokedex = new Pokedex(); //Create an instance of the Pokedex class when the DOM is loaded
});