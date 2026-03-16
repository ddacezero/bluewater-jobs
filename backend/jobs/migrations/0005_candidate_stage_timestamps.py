from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0004_fix_null_text_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='candidate',
            name='stage_timestamps',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
