import Group from "./Group";
import Sample from "./Sample";

class Sound {

    // Sets up all static class defaults. This function is immediately invoked below the Sound class definition to ensure it runs.
    static _initialize(){
        let soundContextClass = window.AudioContext || window.webkitAudioContext;
        Sound.__context = new soundContextClass();

        Sound.__rootGroup = new Group(null);
        Sound.__rootGroup.outputNode.connect(Sound.context.destination);

        Sound.__fileExtensionPriorityList = ["mp3"];
        Sound._strictFallbacks = true;
    }

    // Read-only properties
    static get context(){ return Sound.__context; }
    static get _rootGroup(){ return Sound.__rootGroup; }

    // Simple static properties
    static get strictFallbacks (){ return Sound._strictFallbacks; }
    static set strictFallbacks(val){ Sound._strictFallbacks = val; }

    // More complex static properties

    static get fileExtensionPriorityList(){ return Sound.__fileExtensionPriorityList; }

    static set fileExtensionPriorityList(newList){
        let list = Sound.fileExtensionPriorityList;

        // Swap the array contents in place so external refs stay valid:
        list.splice(0,list.length);
        newList.forEach( item => list.push(item));
    }

    static get fallbackFileExtension(){
        // Look up the fallback file extension each time. Performance cost should be small (since sound loading should be gated by
        // the sound loading part), and the array of fallback file extensions may have changed without our knowledge.

        let testElement = document.createElement("audio");
        let bestMaybe = null;
        for(let i = 0; i < Sound.fileExtensionPriorityList.length; i++){
            let extension = Sound.fileExtensionPriorityList[i];
            let result = testElement.canPlayType("audio/" + extension);

            switch(result){
                case "probably":
                    return extension; // Found a good one, return it
                case "maybe":
                    if(!Sound.strictFallbacks){
                        return extension // Not in strict mode, 'maybe' is okay.
                    }else if(bestMaybe === null){
                        bestMaybe = extension; // Haven't found a best maybe yet, store this one off in case we don't find a "probably".
                    }
                    break;
                case "":
                    // no-op
                default:
                    // no-op
            }
        }

        // We didn't find anything, so return our best maybe, or null if we didn't even find one of those.
        return bestMaybe || null;
    }

    static isExtensionSupported(extension){
        let testElement = document.createElement("audio");
        let result = testElement.canPlayType("audio/" + extension);
        return result !== "";
        // return Sound.strictFallbacks ? result === "probably" : result !== "";
    }

    static pause(){
        // TODO: actually implement pausing and unpausing - just putting this here as a reminder that suspend exists.
        Sound.context.suspend();
    }

    static createInstance(src, startTime = null, duration = null){
        // TODO: start time, duration.
        return new Sample(src);
    }
}

Sound._initialize();

export default Sound;
