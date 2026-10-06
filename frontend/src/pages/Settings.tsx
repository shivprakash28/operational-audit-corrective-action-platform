import React from "react";
import Card, { CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Settings as SettingsIcon } from "lucide-react";

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-slate-600" />
            System Settings & Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600">
            Configure application preferences, notification thresholds, and audit platform settings.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
