export default class Scene {
    constructor() {
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