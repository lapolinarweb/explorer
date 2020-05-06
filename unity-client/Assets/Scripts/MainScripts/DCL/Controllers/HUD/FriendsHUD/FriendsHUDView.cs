using UnityEngine;
using UnityEngine.UI;

public class FriendsHUDView : MonoBehaviour
{
    public const string NOTIFICATIONS_ID = "Friends";
    static int ANIM_PROPERTY_SELECTED = Animator.StringToHash("Selected");

    const string VIEW_PATH = "FriendsHUD";

    public Button closeButton;
    public Button friendsButton;
    public Button friendRequestsButton;
    public FriendsTabView friendsList;
    public FriendRequestsTabView friendRequestsList;

    internal Coroutine currentNotificationRoutine = null;
    internal GameObject currentNotification = null;
    public float notificationsDuration = 3f;

    public static FriendsHUDView Create()
    {
        var view = Instantiate(Resources.Load<GameObject>(VIEW_PATH)).GetComponent<FriendsHUDView>();
        view.Initialize();
        return view;
    }

    private void Initialize()
    {
        friendsList.Initialize(this);
        friendRequestsList.Initialize(this);

        closeButton.onClick.AddListener(Toggle);

        friendsButton.onClick.AddListener(() =>
        {
            friendsButton.animator.SetBool(ANIM_PROPERTY_SELECTED, true);
            friendRequestsButton.animator.SetBool(ANIM_PROPERTY_SELECTED, false);
            friendsList.gameObject.SetActive(true);
            friendRequestsList.gameObject.SetActive(false);
        });

        friendRequestsButton.onClick.AddListener(() =>
        {
            friendsButton.animator.SetBool(ANIM_PROPERTY_SELECTED, false);
            friendRequestsButton.animator.SetBool(ANIM_PROPERTY_SELECTED, true);
            friendsList.gameObject.SetActive(false);
            friendRequestsList.gameObject.SetActive(true);
        });
    }

    public void Toggle()
    {
        gameObject.SetActive(!gameObject.activeSelf);
    }

    //public void TriggerNotification(GameObject notificationGO)
    //{
    //    DismissCurrentNotification();

    //    currentNotification = notificationGO;

    //    notificationGO.SetActive(true);
    //    currentNotificationRoutine = CoroutineStarter.Start(WaitAndCloseCurrentNotification());
    //}

    //IEnumerator WaitAndCloseCurrentNotification()
    //{
    //    yield return WaitForSecondsCache.Get(notificationsDuration);
    //    DismissCurrentNotification();
    //}

    //public void DismissCurrentNotification()
    //{
    //    if (currentNotification == null) return;

    //    currentNotification.SetActive(false);

    //    if (currentNotificationRoutine == null) return;

    //    StopCoroutine(currentNotificationRoutine);
    //    currentNotificationRoutine = null;
    //}

}
