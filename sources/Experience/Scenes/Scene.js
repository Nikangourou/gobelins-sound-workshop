import Time from "../Utils/Time";

export default class Scene {
    constructor(scene) {
        this.isActive = false;
        this.hasBeenCompleted = false;
        this.time = new Time()
    
    }

    init() {
        this.isActive = true

    }

    onNext() {
        this.isActive = false
        // reset Time to zero
        // stop timeline

    }

    restart() {

    }

    loadSceneAssets() {
        
    }
}