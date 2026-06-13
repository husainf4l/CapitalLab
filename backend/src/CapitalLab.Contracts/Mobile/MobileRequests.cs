using CapitalLab.Contracts.Enums;

namespace CapitalLab.Contracts.Mobile;

public record RegisterDeviceRequest(
    string DeviceId,
    DevicePlatform Platform,
    string PushToken);
