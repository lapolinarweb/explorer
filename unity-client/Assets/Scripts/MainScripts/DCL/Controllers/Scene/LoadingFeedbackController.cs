using DCL;
using DCL.Controllers;
using DCL.Interface;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;
using UnityGLTF;

/// <summary>
/// This class recopiles all the needed information to be sent to the kernel and be able to show the feedback along the world loading.
/// </summary>
public class LoadingFeedbackController : MonoBehaviour
{
    private class SceneLoadingStatus
    {
        public int sceneId;
        public int componentsLoading;
    }

    private List<SceneLoadingStatus> loadedScenes;

    private int currentComponentsLoading = 0;
    private int loadingComponentsPercentage = 0;
    private int maxLoadingComponentsRef = 0;

    private int totalActiveDownloads = 0;
    private int downloadingAssetsPercentage = 0;
    private int maxDownloadingAssetsRef = 0;

    private void Start()
    {
        loadedScenes = new List<SceneLoadingStatus>();

        SceneController.i.OnNewSceneAdded += SceneController_OnNewSceneAdded;
        GLTFComponent.OnDownloadingProgressUpdate += GLTFComponent_OnDownloadingProgressUpdate;
        AssetPromise_AB.OnDownloadingProgressUpdate += AssetPromise_AB_OnDownloadingProgressUpdate;
        CommonScriptableObjects.rendererState.OnChange += RendererState_OnChange;
    }

    private void OnDestroy()
    {
        SceneController.i.OnNewSceneAdded -= SceneController_OnNewSceneAdded;
        GLTFComponent.OnDownloadingProgressUpdate -= GLTFComponent_OnDownloadingProgressUpdate;
        AssetPromise_AB.OnDownloadingProgressUpdate -= AssetPromise_AB_OnDownloadingProgressUpdate;
        CommonScriptableObjects.rendererState.OnChange -= RendererState_OnChange;
    }

    private void SceneController_OnNewSceneAdded(ParcelScene scene)
    {
        scene.OnStateRefreshed += Scene_OnStateRefreshed;
    }

    private void Scene_OnStateRefreshed(ParcelScene scene)
    {
        SceneLoadingStatus refreshedScene = new SceneLoadingStatus
        {
            sceneId = scene.GetInstanceID(),
            componentsLoading = scene.disposableNotReadyCount
        };

        switch (scene.state)
        {
            case ParcelScene.State.WAITING_FOR_COMPONENTS:
                AddOrUpdateLoadedScene(refreshedScene);
                break;
            case ParcelScene.State.READY:
                scene.OnStateRefreshed -= Scene_OnStateRefreshed;
                break;
        }

        RefreshFeedbackMessage();
    }

    private void AddOrUpdateLoadedScene(SceneLoadingStatus scene)
    {
        SceneLoadingStatus existingScene = loadedScenes.FirstOrDefault(x => x.sceneId == scene.sceneId);
        if (existingScene == null)
            loadedScenes.Add(scene);
        else
        {
            existingScene.componentsLoading = scene.componentsLoading;
        }
    }

    private void GLTFComponent_OnDownloadingProgressUpdate()
    {
        RefreshFeedbackMessage();
    }

    private void AssetPromise_AB_OnDownloadingProgressUpdate()
    {
        RefreshFeedbackMessage();
    }

    private void RefreshFeedbackMessage()
    {
        if (CommonScriptableObjects.rendererState.Get())
            return;

        string loadingText = string.Empty;
        string secondLoadingText = string.Empty;

        currentComponentsLoading = loadedScenes.Sum(x => x.componentsLoading);
        if (currentComponentsLoading > 0)
        {
            loadingComponentsPercentage = GetLoadingComponentsPercentage(currentComponentsLoading);
            loadingText = string.Format("Loading scenes {0}%", loadingComponentsPercentage);
        }

        totalActiveDownloads = AssetPromiseKeeper_GLTF.i.waitingPromisesCount + AssetPromiseKeeper_AB.i.waitingPromisesCount;
        if (totalActiveDownloads > 0)
        {
            downloadingAssetsPercentage = GetDownloadingAssetsPercentage(totalActiveDownloads);
            secondLoadingText = string.Format("Downloading images, 3D models, and sounds {0}%", downloadingAssetsPercentage);

            if (!string.IsNullOrEmpty(loadingText))
            {
                loadingText += "\\n";
            }

            loadingText += secondLoadingText;
        }

        if (!string.IsNullOrEmpty(loadingText))
            WebInterface.ScenesLoadingFeedback(loadingText);
    }

    private int GetLoadingComponentsPercentage(int currentComponentsLoading)
    {
        if (currentComponentsLoading > maxLoadingComponentsRef)
        {
            maxLoadingComponentsRef = currentComponentsLoading;
            return 0;
        }

        return Mathf.FloorToInt(100f - (currentComponentsLoading * 100f / maxLoadingComponentsRef));
    }

    private int GetDownloadingAssetsPercentage(int totalActiveDownloads)
    {
        if (totalActiveDownloads > maxDownloadingAssetsRef)
        {
            maxDownloadingAssetsRef = totalActiveDownloads;
            return 0;
        }

        return Mathf.FloorToInt(100f - (totalActiveDownloads * 100f / maxDownloadingAssetsRef));
    }

    private void RendererState_OnChange(bool current, bool previous)
    {
        if (!current)
            return;

        loadedScenes.Clear();
        maxLoadingComponentsRef = 0;
        maxDownloadingAssetsRef = 0;
    }
}