using DCL;
using UnityEngine;

public class TaskbarHUDController : IHUD
{
    public const bool WINDOW_STACKING_ENABLED = false;

    internal TaskbarHUDView view;
    public WorldChatWindowHUDController worldChatWindowHud;
    public PrivateChatWindowHUDController privateChatWindowHud;
    public FriendsHUDController friendsHud;
    public bool alreadyToggledOnForFirstTime { get; private set; } = false;

    IMouseCatcher mouseCatcher;
    IChatController chatController;

    public void Initialize(IMouseCatcher mouseCatcher, IChatController chatController)
    {
        this.mouseCatcher = mouseCatcher;
        this.chatController = chatController;

        view = TaskbarHUDView.Create(this, chatController);

        if (mouseCatcher != null)
        {
            mouseCatcher.OnMouseLock -= MouseCatcher_OnMouseLock;
            mouseCatcher.OnMouseUnlock -= MouseCatcher_OnMouseUnlock;
            mouseCatcher.OnMouseLock += MouseCatcher_OnMouseLock;
            mouseCatcher.OnMouseUnlock += MouseCatcher_OnMouseUnlock;
        }

        view.chatHeadsGroup.OnHeadToggleOn += ChatHeadsGroup_OnHeadOpen;
        view.chatHeadsGroup.OnHeadToggleOff += ChatHeadsGroup_OnHeadClose;

        view.windowContainerLayout.enabled = false;

        view.OnChatToggleOff += View_OnChatToggleOff;
        view.OnChatToggleOn += View_OnChatToggleOn;
        view.OnFriendsToggleOff += View_OnFriendsToggleOff;
        view.OnFriendsToggleOn += View_OnFriendsToggleOn;
    }

    private void ChatHeadsGroup_OnHeadClose(TaskbarButton obj)
    {
        privateChatWindowHud.SetVisibility(false);
    }

    private void View_OnFriendsToggleOn()
    {
        friendsHud.SetVisibility(true);
    }

    private void View_OnFriendsToggleOff()
    {
        friendsHud.SetVisibility(false);
    }

    private void View_OnChatToggleOn()
    {
        worldChatWindowHud.SetVisibility(true);
    }

    private void View_OnChatToggleOff()
    {
        worldChatWindowHud.SetVisibility(false);
    }

    private void ChatHeadsGroup_OnHeadOpen(TaskbarButton taskbarBtn)
    {
        ChatHeadButton head = taskbarBtn as ChatHeadButton;

        if (taskbarBtn == null)
            return;

        OpenPrivateChatWindow(head.profile.userId);
    }


    private void MouseCatcher_OnMouseUnlock()
    {
        view.windowContainerCanvasGroup.alpha = 1;
        worldChatWindowHud.view.DeactivatePreview();
    }

    private void MouseCatcher_OnMouseLock()
    {
        view.windowContainerCanvasGroup.alpha = 0;
        view.chatButton.SetToggleState(true);
        worldChatWindowHud.view.ActivatePreview();
    }

    public void AddWorldChatWindow(WorldChatWindowHUDController controller)
    {
        if (controller == null || controller.view == null)
        {
            Debug.LogWarning("AddChatWindow >>> World Chat Window doesn't exist yet!");
            return;
        }

        if (controller.view.transform.parent == view.windowContainer)
            return;

        controller.view.transform.SetParent(view.windowContainer, false);

        worldChatWindowHud = controller;

        view.OnAddChatWindow();
        worldChatWindowHud.view.DeactivatePreview();
    }

    public void AddPrivateChatWindow(PrivateChatWindowHUDController controller)
    {
        if (controller == null || controller.view == null)
        {
            Debug.LogWarning("AddPrivateChatWindow >>> Private Chat Window doesn't exist yet!");
            return;
        }

        if (controller.view.transform.parent == view.windowContainer)
            return;

        controller.view.transform.SetParent(view.windowContainer, false);

        privateChatWindowHud = controller;
    }

    public void AddFriendsWindow(FriendsHUDController controller)
    {
        if (controller == null || controller.view == null)
        {
            Debug.LogWarning("AddFriendsWindow >>> Friends window doesn't exist yet!");
            return;
        }

        if (controller.view.transform.parent == view.windowContainer)
            return;

        controller.view.transform.SetParent(view.windowContainer, false);

        friendsHud = controller;
        view.OnAddFriendsWindow();
    }


    private void OpenPrivateChatWindow(string userId)
    {
        privateChatWindowHud.Configure(userId);
        privateChatWindowHud.SetVisibility(true);
    }

    public void Dispose()
    {
        if (view != null)
        {
            view.chatHeadsGroup.OnHeadToggleOn -= ChatHeadsGroup_OnHeadOpen;
            view.chatHeadsGroup.OnHeadToggleOff -= ChatHeadsGroup_OnHeadClose;

            view.OnChatToggleOff -= View_OnChatToggleOff;
            view.OnChatToggleOn -= View_OnChatToggleOn;
            view.OnFriendsToggleOff -= View_OnFriendsToggleOff;
            view.OnFriendsToggleOn -= View_OnFriendsToggleOn;

            UnityEngine.Object.Destroy(view.gameObject);
        }

        if (mouseCatcher != null)
        {
            mouseCatcher.OnMouseLock -= MouseCatcher_OnMouseLock;
            mouseCatcher.OnMouseUnlock -= MouseCatcher_OnMouseUnlock;
        }
    }

    public void SetVisibility(bool visible)
    {
        view.SetVisibility(visible);
    }

    public void OnPressReturn()
    {
        worldChatWindowHud.OnPressReturn();
    }

    public void OnPressEsc()
    {
        if (mouseCatcher.isLocked)
            return;

        view.chatButton.SetToggleState(true);
        worldChatWindowHud.view.DeactivatePreview();
    }
}
